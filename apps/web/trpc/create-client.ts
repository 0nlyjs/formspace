import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  
  let rawUrl = env.NEXT_PUBLIC_API_URL;
  
  // Dynamic fallback when env var is not set or empty
  if (!rawUrl && typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      rawUrl = "http://localhost:8000";
    } else {
      rawUrl = "https://repoapi-production-852d.up.railway.app";
    }
  } else if (!rawUrl) {
    rawUrl = "http://localhost:8000";
  }

  let baseUrl = rawUrl.trim().replace(/\/+$/, "");

  // Prepend protocol if it's a bare domain name (e.g. repoapi-production-852d.up.railway.app)
  if (baseUrl && !/^https?:\/\//i.test(baseUrl) && !baseUrl.startsWith("/")) {
    baseUrl = `https://${baseUrl}`;
  }

  const finalUrl = baseUrl.endsWith("/trpc") ? baseUrl : `${baseUrl}/trpc`;

  if (typeof window !== "undefined") {
    console.log("[tRPC Client] Connecting to backend at:", finalUrl);
  }

  return c({
    url: finalUrl,
    fetch(url, options) {
      let token = "";
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token") || "";
      }
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
    },
  });
};
