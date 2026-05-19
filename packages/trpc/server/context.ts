import * as trpcExpress from "@trpc/server/adapters/express";
import UserService from "@repo/services/user";

const userService = new UserService();

export async function createContext({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) {
  // Extract token from Authorization header or from cookies
  let token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.substring(7)
    : undefined;

  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);
    token = cookies["token"] || cookies["session"];
  }

  let user = null;
  if (token) {
    const decoded = userService.verifyToken(token);
    if (decoded) {
      user = await userService.getUserById(decoded.id);
    }
  }

  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || null;

  return {
    req,
    res,
    user,
    ipAddress,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
