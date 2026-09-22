import { signUpAction } from "@/app/auth/actions";
import { handleApiError, json, parseJson } from "@/lib/api-utils";
import { enforceRateLimit } from "@/lib/rate-limit";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(request, "auth-register", { maxRequests: 8 });
    if (limited.response) {
      return limited.response;
    }

    const input = await parseJson(request, signUpSchema);
    const result = await signUpAction(input);

    if (!result.ok) {
      return json({ error: result.error }, 400);
    }

    return json({ ok: true, redirectTo: result.redirectTo }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
