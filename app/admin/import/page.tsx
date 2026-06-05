import { redirect } from "next/navigation";

type AdminImportRedirectProps = {
  searchParams?: Promise<{
    importStatus?: string;
    importMessage?: string;
  }>;
};

export default async function AdminImportRedirectPage({ searchParams }: AdminImportRedirectProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params?.importStatus) {
    query.set("importStatus", params.importStatus);
  }

  if (params?.importMessage) {
    query.set("importMessage", params.importMessage);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/admin/students${suffix}`);
}
