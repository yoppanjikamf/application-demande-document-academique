"use client";

import { CreditCard, Download, Eye } from "lucide-react";

import {
  DashboardListPanel,
  DashboardListPanelHeader,
} from "@/components/dashboard/dashboard-list-panel";
import { paymentTone, StatusBadge } from "@/components/dashboard/status-badge";
import { useI18n } from "@/components/i18n/locale-provider";
import { LocaleDate, PaymentModeText, PaymentStatusText } from "@/components/i18n/ui";
import { Button } from "@/components/ui/button";

type PaymentItem = {
  id: string;
  name: string;
  mode: string;
  createdAt: string;
  statut: "EN_ATTENTE" | "EFFECTUE" | "ANNULE";
  receiptNumber: string | null;
};

export function StudentPaymentsView({ payments }: { payments: PaymentItem[] }) {
  const { t } = useI18n();

  return (
    <DashboardListPanel>
      <DashboardListPanelHeader
        left={t("dashboard.payments.payment")}
        right={t("dashboard.payments.status")}
      />
      <div className="divide-y divide-[#E8EEF6]">
        {payments.length === 0 ? (
          <div className="px-4 py-10 text-center sm:px-5">
            <CreditCard className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-3 text-sm text-text-3">{t("dashboard.payments.empty")}</p>
          </div>
        ) : (
          payments.map((payment) => (
            <article
              key={payment.id}
              className="flex flex-col gap-4 px-4 py-4 sm:px-5 md:flex-row md:items-start md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium text-text-1">{payment.name}</p>
                <p className="mt-1 text-sm text-text-3">
                  <PaymentModeText mode={payment.mode} /> · <LocaleDate value={payment.createdAt} />
                </p>
                {payment.receiptNumber ? (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <span className="break-all text-sm text-text-3">
                      {t("dashboard.payments.receipt", { numero: payment.receiptNumber })}
                    </span>
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <a
                        href={`/api/students/me/payments/${payment.id}/receipt`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                        {t("dashboard.payments.viewReceipt")}
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <a href={`/api/students/me/payments/${payment.id}/receipt?download=1`}>
                        <Download className="h-4 w-4" />
                        {t("dashboard.payments.download")}
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-text-3">{t("dashboard.payments.pendingReceipt")}</p>
                )}
              </div>
              <StatusBadge tone={paymentTone(payment.statut)}>
                <PaymentStatusText statut={payment.statut} />
              </StatusBadge>
            </article>
          ))
        )}
      </div>
    </DashboardListPanel>
  );
}
