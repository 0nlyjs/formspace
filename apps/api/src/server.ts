import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";

export const app = express();

app.use((req, res, next) => {
  console.log(`[Express API] ${req.method} ${req.url}`);
  next();
});

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Formspace OpenAPI Docs",
  description: "Production-style Form Builder SaaS APIs with 3D templates support",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

// IP-based Rate Limiter for Public Response Submissions
const ipSubmissions = new Map<string, number[]>();

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const path = req.path;
  if (path.includes("/responses/submit") || path.includes("/submit")) {
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = 20; // Max 20 submissions per minute per IP

    let timestamps = ipSubmissions.get(ip) || [];
    // Keep only timestamps within current window
    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= limit) {
      res.status(429).json({
        error: {
          message: "Too many submissions. Please wait 1 minute before submitting again.",
        },
      });
      return;
    }

    timestamps.push(now);
    ipSubmissions.set(ip, timestamps);
  }
  next();
}

app.use(
  cors({
    origin: true,
    credentials: true, // Allow cookie session transmission
    allowedHeaders: ["Authorization", "Content-Type", "Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(rateLimiter);

app.get("/", (req, res) => {
  return res.json({ message: "Formspace server is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Formspace server is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", async (req, res, next) => {
  try {
    const { apiReference } = await import("@scalar/express-api-reference");
    apiReference({ url: "/openapi.json" })(req, res, next);
  } catch (err) {
    next(err);
  }
});

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
