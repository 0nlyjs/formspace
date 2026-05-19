import { z } from "../../schema";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db, eq, and } from "@repo/database";
import { apiKeysTable } from "@repo/database/schema";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

const TAGS = ["API Keys"];
const getPath = generatePath("/apikeys");

export const apiKeyRouter = router({
  generate: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/generate"), tags: TAGS } })
    .input(z.object({ description: z.string().optional() }))
    .output(
      z.object({
        id: z.string(),
        key: z.string(), // returned only once
        description: z.string().nullable(),
        createdAt: z.date().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Create random key: e.g. fs_key_abcd1234...
      const rawKey = `fs_key_${crypto.randomBytes(24).toString("hex")}`;
      const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

      const [apiKey] = await db
        .insert(apiKeysTable)
        .values({
          userId: ctx.user.id,
          keyHash,
          description: input.description ?? "API Token",
        })
        .returning();

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate API key",
        });
      }

      return {
        id: apiKey.id,
        key: rawKey,
        description: apiKey.description,
        createdAt: apiKey.createdAt,
      };
    }),

  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(z.any().optional())
    .output(
      z.array(
        z.object({
          id: z.string(),
          description: z.string().nullable(),
          createdAt: z.date().nullable(),
        })
      )
    )
    .query(async ({ ctx }) => {
      const keys = await db
        .select({
          id: apiKeysTable.id,
          description: apiKeysTable.description,
          createdAt: apiKeysTable.createdAt,
        })
        .from(apiKeysTable)
        .where(eq(apiKeysTable.userId, ctx.user.id));

      return keys;
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/delete"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const result = await db
        .delete(apiKeysTable)
        .where(and(eq(apiKeysTable.id, input.id), eq(apiKeysTable.userId, ctx.user.id)))
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      return { success: true };
    }),
});
