import { z } from "../../schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db, eq, and, sql, asc, desc } from "@repo/database";
import { formsTable, fieldsTable, responsesTable, usersTable } from "@repo/database/schema";
import { TRPCError } from "@trpc/server";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

// Schemas for nested fields
const FieldInputSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum([
    "short_text",
    "long_text",
    "email",
    "number",
    "single_select",
    "multi_select",
    "checkbox",
    "rating",
    "date",
  ]),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional().nullable(),
  required: z.boolean().default(false),
  placeholder: z.string().optional().nullable(),
  options: z.array(z.string()).optional().nullable(), // choices for selects
  validations: z.record(z.string(), z.any()).optional().nullable(), // validation rules (min, max, regex, etc.)
  logic: z.array(z.record(z.string(), z.any())).optional().nullable(), // conditional logic rules
  order: z.number().default(0),
});

export const formRouter = router({
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        theme: z.enum(["manga pop", "fresh leaf", "pure abstract", "anime", "tech", "retro"]).default("manga pop"),
        visibility: z.enum(["public", "unlisted"]).default("public"),
      })
    )
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        theme: z.string(),
        visibility: z.string(),
        status: z.string(),
        createdAt: z.date().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Create a unique URL slug
      const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 7)}`;
      
      const [form] = await db
        .insert(formsTable)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description ?? "",
          slug,
          theme: input.theme,
          visibility: input.visibility,
          status: "draft",
        })
        .returning();

      if (!form) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create form",
        });
      }

      // Add a default first question based on theme
      await db.insert(fieldsTable).values({
        formId: form.id,
        type: "short_text",
        label: "Welcome to your new form! What is your name?",
        required: true,
        order: 0,
      });

      return {
        id: form.id,
        title: form.title,
        slug: form.slug,
        theme: form.theme,
        visibility: form.visibility,
        status: form.status,
        createdAt: form.createdAt,
      };
    }),

  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(z.object({}).optional().default({}))
    .output(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().nullable(),
          slug: z.string(),
          theme: z.string(),
          visibility: z.string(),
          status: z.string(),
          createdAt: z.date().nullable(),
          responseCount: z.number(),
        })
      )
    )
    .query(async ({ ctx }) => {
      // Get all creator's forms along with their response count
      const forms = await db
        .select({
          id: formsTable.id,
          title: formsTable.title,
          description: formsTable.description,
          slug: formsTable.slug,
          theme: formsTable.theme,
          visibility: formsTable.visibility,
          status: formsTable.status,
          createdAt: formsTable.createdAt,
          responseCount: sql<number>`cast(count(${responsesTable.id}) as integer)`,
        })
        .from(formsTable)
        .leftJoin(responsesTable, eq(responsesTable.formId, formsTable.id))
        .where(eq(formsTable.userId, ctx.user.id))
        .groupBy(formsTable.id)
        .orderBy(sql`${formsTable.createdAt} desc`);

      return forms;
    }),

  get: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/detail"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        slug: z.string(),
        theme: z.string(),
        visibility: z.string(),
        status: z.string(),
        password: z.string().nullable(),
        expiresAt: z.date().nullable(),
        responseLimit: z.number().nullable(),
        emailNotifications: z.boolean(),
        emailConfirmations: z.boolean(),
        fields: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            label: z.string(),
            description: z.string().nullable(),
            required: z.boolean(),
            placeholder: z.string().nullable(),
            options: z.any().nullable(),
            validations: z.any().nullable(),
            logic: z.any().nullable(),
            order: z.number(),
          })
        ),
      })
    )
    .query(async ({ input, ctx }) => {
      const [form] = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, input.formId), eq(formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or you do not have permission to view it",
        });
      }

      const fields = await db
        .select()
        .from(fieldsTable)
        .where(eq(fieldsTable.formId, form.id))
        .orderBy(asc(fieldsTable.order));

      return {
        ...form,
        fields,
      };
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/update"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional().nullable(),
        slug: z.string().min(1),
        theme: z.enum(["manga pop", "fresh leaf", "pure abstract", "anime", "tech", "retro"]),
        visibility: z.enum(["public", "unlisted"]),
        status: z.enum(["draft", "published"]),
        password: z.string().optional().nullable(),
        expiresAt: z.date().optional().nullable(),
        responseLimit: z.number().optional().nullable(),
        emailNotifications: z.boolean().optional(),
        emailConfirmations: z.boolean().optional(),
        fields: z.array(FieldInputSchema),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
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

      // Check if custom slug is taken by another form
      if (input.slug !== form.slug) {
        const [existing] = await db
          .select()
          .from(formsTable)
          .where(eq(formsTable.slug, input.slug))
          .limit(1);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Slug is already in use by another form",
          });
        }
      }

      // 2. Update Form settings
      await db
        .update(formsTable)
        .set({
          title: input.title,
          description: input.description,
          slug: input.slug,
          theme: input.theme,
          visibility: input.visibility,
          status: input.status,
          password: input.password || null,
          expiresAt: input.expiresAt || null,
          responseLimit: input.responseLimit || null,
          emailNotifications: input.emailNotifications ?? true,
          emailConfirmations: input.emailConfirmations ?? true,
        })
        .where(eq(formsTable.id, input.formId));

      // 3. Atomically sync fields: Delete removed fields, Insert new, Update existing
      const currentFields = await db
        .select({ id: fieldsTable.id })
        .from(fieldsTable)
        .where(eq(fieldsTable.formId, input.formId));
      
      const currentIds = currentFields.map((f: { id: string }) => f.id);
      const incomingIds = input.fields.map(f => f.id).filter((id): id is string => !!id);

      // Identify fields to delete
      const idsToDelete = currentIds.filter((id: string) => !incomingIds.includes(id));
      if (idsToDelete.length > 0) {
        await db.delete(fieldsTable).where(
          and(
            eq(fieldsTable.formId, input.formId),
            sql`${fieldsTable.id} in ${idsToDelete}`
          )
        );
      }

      // Insert and Update in order
      for (const field of input.fields) {
        if (field.id && currentIds.includes(field.id)) {
          // Update
          await db
            .update(fieldsTable)
            .set({
              type: field.type,
              label: field.label,
              description: field.description,
              required: field.required,
              placeholder: field.placeholder,
              options: field.options,
              validations: field.validations,
              logic: field.logic,
              order: field.order,
            })
            .where(eq(fieldsTable.id, field.id));
        } else {
          // Insert
          await db.insert(fieldsTable).values({
            formId: input.formId,
            type: field.type,
            label: field.label,
            description: field.description,
            required: field.required,
            placeholder: field.placeholder,
            options: field.options,
            validations: field.validations,
            logic: field.logic,
            order: field.order,
          });
        }
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/delete"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const result = await db
        .delete(formsTable)
        .where(and(eq(formsTable.id, input.formId), eq(formsTable.userId, ctx.user.id)))
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or unauthorized",
        });
      }

      return { success: true };
    }),

  listPublic: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/explore"), tags: TAGS } })
    .input(z.object({}).optional().default({}))
    .output(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().nullable(),
          slug: z.string(),
          theme: z.string(),
          createdAt: z.date().nullable(),
          creatorName: z.string(),
        })
      )
    )
    .query(async () => {
      const publicForms = await db
        .select({
          id: formsTable.id,
          title: formsTable.title,
          description: formsTable.description,
          slug: formsTable.slug,
          theme: formsTable.theme,
          createdAt: formsTable.createdAt,
          creatorName: usersTable.fullName,
        })
        .from(formsTable)
        .innerJoin(usersTable, eq(formsTable.userId, usersTable.id))
        .where(
          and(
            eq(formsTable.visibility, "public"),
            eq(formsTable.status, "published")
          )
        )
        .orderBy(desc(formsTable.createdAt));
      return publicForms;
    }),

  getPublicBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/public"), tags: TAGS } })
    .input(z.object({ slug: z.string(), password: z.string().optional() }))
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        theme: z.string(),
        visibility: z.string(),
        status: z.string(),
        isPasswordProtected: z.boolean(),
        passwordMatched: z.boolean(),
        fields: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            label: z.string(),
            description: z.string().nullable(),
            required: z.boolean(),
            placeholder: z.string().nullable(),
            options: z.any().nullable(),
            validations: z.any().nullable(),
            logic: z.any().nullable(),
            order: z.number(),
          })
        ).optional(),
      })
    )
    .query(async ({ input }) => {
      const [form] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.slug, input.slug))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This form does not exist or has been deleted",
        });
      }

      if (form.status !== "published") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is currently in draft mode and not accepting responses",
        });
      }

      // Check Expiry Date
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form has expired and is no longer accepting responses",
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
            message: "This form has reached its response limit and is closed",
          });
        }
      }

      // Password Protection Validation
      const isPasswordProtected = !!form.password;
      const passwordMatched = !isPasswordProtected || form.password === input.password;

      const output: any = {
        id: form.id,
        title: form.title,
        description: form.description,
        theme: form.theme,
        visibility: form.visibility,
        status: form.status,
        isPasswordProtected,
        passwordMatched,
      };

      // Only return fields if password matches (or if there is no password)
      if (passwordMatched) {
        const fields = await db
          .select()
          .from(fieldsTable)
          .where(eq(fieldsTable.formId, form.id))
          .orderBy(asc(fieldsTable.order));
        output.fields = fields;
      }

      return output;
    }),
});
