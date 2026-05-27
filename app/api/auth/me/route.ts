import { getCurrentUser } from "@/lib/auth";
import { handleApiError, json } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return json({ user: null }, 401);
    }

    return json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
