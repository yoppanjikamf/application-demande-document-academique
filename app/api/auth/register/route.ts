import { signUpAction } from "@/app/auth/actions";
import { handleApiError, json, parseJson } from "@/lib/api-utils";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
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
