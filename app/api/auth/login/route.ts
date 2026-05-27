import { z } from "zod";

import { signInAction } from "@/app/auth/actions";
import { handleApiError, json, parseJson } from "@/lib/api-utils";
import { signInSchema } from "@/lib/validations";

const apiSignInSchema = signInSchema.extend({
  next: z.string().optional(),
});

export async function POST(request: Request) {
  try {
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
