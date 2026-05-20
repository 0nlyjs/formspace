import { z } from "../../schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db, eq, and, sql, desc } from "@repo/database";
import { formsTable, fieldsTable, responsesTable, usersTable } from "@repo/database/schema";
import { TRPCError } from "@trpc/server";
import { emailService } from "../../services";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

export const responseRouter = router({
  submit: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/submit"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid(),
        answers: z.record(z.string(), z.any()), // key: fieldId, value: response value
      })
    )
    .output(z.object({ success: z.boolean(), submissionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 1. Fetch form to verify it is published and accepts submissions
      const [form] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.id, input.formId))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.status !== "published") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is not active",
        });
      }

      // Check Expiry Date
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form has expired",
        });
      }

      // Check Response Limit
      if (form.responseLimit) {
        const [respCount] = await db
          .select({ count: sql<number>`cast(count(${responsesTable.id}) as integer)` })
          .from(responsesTable)
          .where(eq(responsesTable.formId, form.id));
        if (respCount && respCount.count >= form.responseLimit) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This form has reached its response limit",
          });
        }
      }

      // 2. Fetch all fields to perform validation
      const fields = await db
        .select()
        .from(fieldsTable)
        .where(eq(fieldsTable.formId, form.id));

      const validatedAnswers: Record<string, any> = {};

      for (const field of fields) {
        const value = input.answers[field.id];

        // Check required fields
        if (field.required) {
          if (field.type === "checkbox" && value !== "Yes") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `You must check the required box for "${field.label}"`,
            });
          }
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Question "${field.label}" is required`,
            });
          }
        }

        if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
          // Perform basic format validations
          if (field.type === "email" && typeof value === "string") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Invalid email format for "${field.label}"`,
              });
            }
          }

          if (field.type === "number") {
            const parsed = Number(value);
            if (isNaN(parsed)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Question "${field.label}" must be a number`,
              });
            }
          }

          if (field.type === "rating") {
            const ratingVal = Number(value);
            if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Rating for "${field.label}" must be between 1 and 5`,
              });
            }
          }

          validatedAnswers[field.id] = value;
        }
      }

      // 3. Save response to database
      const [response] = await db
        .insert(responsesTable)
        .values({
          formId: form.id,
          answers: validatedAnswers,
          ipAddress: ctx.ipAddress || null,
        })
        .returning();

      if (!response) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit response",
        });
      }

      // 4. Send Email Notifications/Confirmations in background
      try {
        const [creator] = await db
          .select({ email: usersTable.email })
          .from(usersTable)
          .where(eq(usersTable.id, form.userId))
          .limit(1);

        if (creator) {
          const emailAnswers = fields.map((f) => ({
            label: f.label,
            type: f.type,
            value: validatedAnswers[f.id] !== undefined ? validatedAnswers[f.id] : "-",
          }));

          const emailField = fields.find((f) => f.type === "email");
          const respondentEmail = emailField ? validatedAnswers[emailField.id] : null;

          // Asynchronous non-blocking dispatch
          (async () => {
            try {
              if (form.emailNotifications && creator.email) {
                await emailService.sendCreatorNotification(
                  creator.email,
                  form.title,
                  emailAnswers,
                  response.id
                );
              }
              if (form.emailConfirmations && respondentEmail && typeof respondentEmail === "string") {
                await emailService.sendRespondentConfirmation(
                  respondentEmail,
                  form.title,
                  emailAnswers
                );
              }
            } catch (backgroundError) {
              console.error("Error in background email sending process:", backgroundError);
            }
          })();
        }
      } catch (emailQueryError) {
        console.error("Failed to initiate email sending:", emailQueryError);
      }

      return {
        success: true,
        submissionId: response.id,
      };
    }),

  listResponses: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.array(
        z.object({
          id: z.string(),
          answers: z.any(),
          ipAddress: z.string().nullable(),
          submittedAt: z.date().nullable(),
        })
      )
    )
    .query(async ({ input, ctx }) => {
      // Confirm ownership
      const [form] = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, input.formId), eq(formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      const responses = await db
        .select()
        .from(responsesTable)
        .where(eq(responsesTable.formId, form.id))
        .orderBy(desc(responsesTable.submittedAt));

      return responses;
    }),

  getAnalytics: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/analytics"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.object({
        totalSubmissions: z.number(),
        fieldsSummary: z.array(
          z.object({
            fieldId: z.string(),
            label: z.string(),
            type: z.string(),
            averageRating: z.number().nullable().optional(),
            choicesBreakdown: z.record(z.string(), z.number()).nullable().optional(), // key: option, value: count
            recentResponses: z.array(z.string()).optional(),
          })
        ),
        timeline: z.array(
          z.object({
            date: z.string(),
            count: z.number(),
          })
        ),
      })
    )
    .query(async ({ input, ctx }) => {
      // 1. Verify ownership of form
      const [form] = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, input.formId), eq(formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // 2. Fetch responses & fields
      const fields = await db
        .select()
        .from(fieldsTable)
        .where(eq(fieldsTable.formId, form.id));

      const responses = await db
        .select()
        .from(responsesTable)
        .where(eq(responsesTable.formId, form.id));

      const totalSubmissions = responses.length;

      // 3. Compile summary of each field
      const fieldsSummary = fields.map((field: any) => {
        const answersList = responses
          .map((r: any) => (r.answers as Record<string, any>)[field.id])
          .filter((val: any) => val !== undefined && val !== null && val !== "");

        const summary: any = {
          fieldId: field.id,
          label: field.label,
          type: field.type,
        };

        if (field.type === "rating") {
          const sum = answersList.reduce((acc: number, curr: any) => acc + Number(curr), 0);
          summary.averageRating = answersList.length > 0 ? Number((sum / answersList.length).toFixed(1)) : 0;
        }

        if (
          field.type === "single_select" ||
          field.type === "multi_select" ||
          field.type === "checkbox"
        ) {
          const counts: Record<string, number> = {};
          
          // Seed options in the chart breakdown
          const optionsList = (field.options as string[]) || [];
          optionsList.forEach((opt) => {
            counts[opt] = 0;
          });

          answersList.forEach((ans: any) => {
            if (Array.isArray(ans)) {
              ans.forEach((subAns: any) => {
                counts[String(subAns)] = (counts[String(subAns)] || 0) + 1;
              });
            } else {
              counts[String(ans)] = (counts[String(ans)] || 0) + 1;
            }
          });

          summary.choicesBreakdown = counts;
        }

        // Return latest 5 answers as recent text snippets
        if (field.type === "short_text" || field.type === "long_text" || field.type === "email") {
          summary.recentResponses = answersList.slice(0, 5).map((val: any) => String(val));
        }

        return summary;
      });

      // 4. Calculate submissions timeline by day (last 7 days)
      const dayCounts: Record<string, number> = {};
      
      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayString = d.toISOString().split("T")[0];
        if (dayString) dayCounts[dayString] = 0;
      }

      responses.forEach((r: any) => {
        if (r.submittedAt) {
          const dayString = new Date(r.submittedAt).toISOString().split("T")[0];
          if (dayString && dayCounts[dayString] !== undefined) {
            dayCounts[dayString] += 1;
          }
        }
      });

      const timeline = Object.entries(dayCounts).map(([date, count]) => ({
        date,
        count,
      }));

      return {
        totalSubmissions,
        fieldsSummary,
        timeline,
      };
    }),
});
