import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Button } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_STATUSES,
  getDocumentStatusLabel,
  getStudentDocuments,
} from "@/services/documents.service";
import dayjs from "dayjs";
import Link from "next/link";

const STATUS_STYLES = {
  PAS_DISPONIBLE: "bg-[#D34053]/10 text-[#D34053]",
  DISPONIBLE: "bg-[#219653]/10 text-[#219653]",
  RETIRE: "bg-[#FFA70B]/10 text-[#FFA70B]",
};

type DocumentsPageProps = {
  searchParams?: Promise<{ statut?: string }>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const status = DOCUMENT_STATUSES.find((value) => value === params?.statut);

  const documents = await getStudentDocuments();
  const filtered = status
    ? documents.filter((item) => item.status === status)
    : documents;

  const counters = DOCUMENT_STATUSES.map((value) => ({
    status: value,
    count: documents.filter((item) => item.status === value).length,
  }));

  return (
    <div>
      <Breadcrumb pageName="Documents" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {counters.map((item) => (
          <div
            key={item.status}
            className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark dark:shadow-card"
          >
            <p className="text-sm text-dark-6">{getDocumentStatusLabel(item.status)}</p>
            <p className="mt-2 text-2xl font-bold text-dark dark:text-white">
              {item.count}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/documents"
          className={cn(
            "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium",
            !status
              ? "bg-primary text-white"
              : "border border-stroke text-dark dark:border-dark-3 dark:text-white",
          )}
        >
          Tous
        </Link>
        {DOCUMENT_STATUSES.map((item) => (
          <Link
            key={item}
            href={`/documents?statut=${item}`}
            className={cn(
              "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium",
              status === item
                ? "bg-primary text-white"
                : "border border-stroke text-dark dark:border-dark-3 dark:text-white",
            )}
          >
            {getDocumentStatusLabel(item)}
          </Link>
        ))}
      </div>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="grid grid-cols-[1fr_auto] border-b border-stroke px-6 py-4 text-sm font-medium text-dark-4 dark:border-dark-3 dark:text-dark-6">
          <span>Document</span>
          <span>Action</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-dark-6">
            Aucun document pour ce filtre.
          </div>
        ) : (
          filtered.map((document) => {
            const canSchedule =
              document.status === "DISPONIBLE" && !document.appointment;

            return (
              <div
                key={document.id}
                className="grid gap-4 border-b border-stroke px-6 py-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-dark dark:text-white">
                      {document.title}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        STATUS_STYLES[document.status],
                      )}
                    >
                      {getDocumentStatusLabel(document.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-dark-6">
                    Lieu: {document.location}
                  </p>
                  <p className="text-sm text-dark-6">
                    Mis a jour: {dayjs(document.updatedAt).format("DD/MM/YYYY")}
                  </p>
                  {document.appointment ? (
                    <p className="text-sm text-dark-6">
                      RDV: {dayjs(document.appointment.date).format("DD/MM/YYYY")} {" "}
                      {document.appointment.time}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {document.appointment ? (
                    <Link
                      href={`/rendez-vous?documentId=${document.id}`}
                      className="inline-flex items-center rounded-md border border-stroke px-4 py-2 text-sm font-medium text-dark hover:border-primary dark:border-dark-3 dark:text-white"
                    >
                      Voir RDV
                    </Link>
                  ) : (
                    <Button
                      label="Planifier RDV"
                      size="small"
                      variant={canSchedule ? "primary" : "outlineDark"}
                      className={canSchedule ? "" : "opacity-50"}
                      aria-disabled={!canSchedule}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
