import { router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { formRouter } from "./routes/form/route";
import { responseRouter } from "./routes/response/route";
import { apiKeyRouter } from "./routes/apiKey/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  form: formRouter,
  response: responseRouter,
  apiKey: apiKeyRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
