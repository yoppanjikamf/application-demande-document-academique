import { z } from "zod";

import { signInAction } from "@/app/auth/actions";
import { handleApiError, json, parseJson } from "@/lib/api-utils";
import { enforceRateLimit } from "@/lib/rate-limit";
import { signInSchema } from "@/lib/validations";

const apiSignInSchema = signInSchema.extend({
  next: z.string().optional(),
  loginOrganisme: z.enum(["OBC", "DECC"]).optional(),
});

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(request, "auth-login", { maxRequests: 15 });
    if (limited.response) {
      return limited.response;
    }

    const input = await parseJson(request, apiSignInSchema);
    const result = await signInAction(input);

    if (!result.ok) {
      return json({ error: result.error }, 401);
    }

    return json({ ok: true, redirectTo: result.redirectTo });
  } catch (error) {
    return handleApiError(error);
  }
}
