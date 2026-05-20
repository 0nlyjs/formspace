import { z } from "zod";

export const zodUndefinedModel = z.object({}).optional().default({}).describe("undefined");
export { z };
