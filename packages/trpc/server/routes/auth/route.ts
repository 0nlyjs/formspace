import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  signup: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signup"), tags: TAGS } })
    .input(
      z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .output(
      z.object({
        id: z.string(),
        fullName: z.string(),
        email: z.string(),
        profileImageUrl: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await userService.createUser(input.fullName, input.email, input.password);
      
      // Generate and set session token in HTTP-only cookie
      const token = userService.generateToken(user.id);
      if (ctx.res) {
        ctx.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      return user;
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), tags: TAGS } })
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string(),
      })
    )
    .output(
      z.object({
        id: z.string(),
        fullName: z.string(),
        email: z.string(),
        profileImageUrl: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await userService.validateUser(input.email, input.password);

      // Generate and set session token in HTTP-only cookie
      const token = userService.generateToken(user.id);
      if (ctx.res) {
        ctx.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      return user;
    }),

  logout: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      if (ctx.res) {
        ctx.res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
      }
      return { success: true };
    }),

  me: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(
      z.object({
        id: z.string(),
        fullName: z.string(),
        email: z.string(),
        profileImageUrl: z.string().nullable().optional(),
      }).nullable()
    )
    .query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return ctx.user;
    }),
});
