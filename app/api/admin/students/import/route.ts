import { importTestDataAction } from "@/app/admin/actions";
import { ApiError, handleApiError, json, requireApiUser } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    await requireApiUser("ADMINISTRATEUR");
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError("Fichier CSV manquant.", 400);
    }

    await importTestDataAction(formData);
    return json({ ok: true }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
