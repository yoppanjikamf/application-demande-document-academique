import { importTestDataFromCsv } from "@/app/admin/actions";
import { ApiError, handleApiError, json, requireApiUser } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser("ADMINISTRATEUR");
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError("Fichier CSV manquant.", 400);
    }

    try {
      const result = await importTestDataFromCsv(formData, user);
      return json({ ok: true, ...result }, 201);
    } catch (error) {
      throw new ApiError(error instanceof Error ? error.message : "Import CSV impossible.", 400);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
