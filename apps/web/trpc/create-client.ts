import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  const baseUrl = env.NEXT_PUBLIC_API_URL ? env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "") : "";
  return c({
    url: baseUrl
      ? (baseUrl.endsWith("/trpc") ? baseUrl : `${baseUrl}/trpc`)
      : "/trpc",
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
