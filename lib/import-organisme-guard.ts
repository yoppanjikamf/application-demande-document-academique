import type { DiplomePrincipal } from "@/lib/generated/prisma/client";
import { getOrganismeForDiplome, getOrganismeNameById } from "@/lib/document-routing";

export function assertDiplomeMatchesAdminOrganisme(
  adminOrganismeId: string | null | undefined,
  diplomeType: DiplomePrincipal,
  rowLabel: string,
) {
  const adminOrg = getOrganismeNameById(adminOrganismeId);
  if (!adminOrg) {
    return;
  }

  const documentOrg = getOrganismeForDiplome(diplomeType);
  if (documentOrg !== adminOrg) {
    throw new Error(
      `${rowLabel} : le diplôme ${diplomeType} relève de ${documentOrg}. Utilisez le fichier CSV ${documentOrg} de votre région.`,
    );
  }
}
