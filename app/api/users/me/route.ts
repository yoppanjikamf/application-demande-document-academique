import { updateProfileAction } from "@/app/account/actions";
import { handleApiError, json, parseJson } from "@/lib/api-utils";
import { profileUpdateSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  try {
    const input = await parseJson(request, profileUpdateSchema);
    const result = await updateProfileAction(input);

    if (!result.ok) {
      return json({ error: result.error }, 400);
    }

    return json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
