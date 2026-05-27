import { ApiError, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("ELEVE");
    const { paymentId } = await params;
    const payment = await prisma.paiement.findFirst({
      where: {
        id: paymentId,
        OR: [{ duplicata: { eleveId: user.id } }, { documentAcademique: { eleveId: user.id } }],
      },
      include: {
        duplicata: true,
        documentAcademique: true,
        recu: true,
      },
    });

    if (!payment) {
      throw new ApiError("Paiement introuvable.", 404);
    }

    return json({ payment });
  } catch (error) {
    return handleApiError(error);
  }
}
