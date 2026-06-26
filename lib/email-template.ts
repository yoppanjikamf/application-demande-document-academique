import { getAppBaseUrl } from "@/lib/site-url";

type EmailTone = "default" | "success" | "warning" | "danger" | "info";

type DetailItem = {
  label: string;
  value: string;
};

type EmailTemplateInput = {
  title: string;
  preheader?: string;
  eyebrow?: string;
  intro?: string;
  body?: string | string[];
  details?: DetailItem[];
  cta?: {
    label: string;
    href: string;
  };
  tone?: EmailTone;
  footerNote?: string;
};

const toneStyles: Record<EmailTone, { accent: string; accentSoft: string; label: string }> = {
  default: { accent: "#17324D", accentSoft: "#EAF1F8", label: "Information" },
  success: { accent: "#2D6A4F", accentSoft: "#EAF7F0", label: "Confirmé" },
  warning: { accent: "#9A6700", accentSoft: "#FFF6DB", label: "À vérifier" },
  danger: { accent: "#B42318", accentSoft: "#FDECEC", label: "Important" },
  info: { accent: "#175CD3", accentSoft: "#EAF2FF", label: "Mise à jour" },
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveEmailHref(href: string) {
  if (!href.startsWith("/")) {
    return href;
  }

  const appUrl = getAppBaseUrl();
  return appUrl ? `${appUrl}${href}` : href;
}

function paragraphHtml(value: string) {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#46596A;font-size:15px;line-height:1.65;">${paragraph.replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

function renderDetails(details: DetailItem[]) {
  if (details.length === 0) {
    return "";
  }

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;border-collapse:separate;border-spacing:0;background:#F6F8FB;border:1px solid #E3EAF2;border-radius:14px;overflow:hidden;">
      <tbody>
        ${details
          .map(
            (item, index) => `
              <tr>
                <td style="padding:${index === 0 ? "18px" : "14px"} 18px 8px;color:#718096;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(item.label)}</td>
              </tr>
              <tr>
                <td style="padding:0 18px 16px;color:#172B3A;font-size:15px;font-weight:700;border-bottom:${index === details.length - 1 ? "0" : "1px solid #E3EAF2"};">${escapeHtml(item.value)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

export function renderBrandedEmail(input: EmailTemplateInput) {
  const tone = toneStyles[input.tone ?? "default"];
  const body = Array.isArray(input.body) ? input.body.join("\n\n") : (input.body ?? "");
  const preheader = input.preheader ?? input.intro ?? input.title;
  const footerNote =
    input.footerNote ??
    "Ce message est généré automatiquement par la plateforme DR-DOCSCOL. Merci de ne pas répondre directement à cet email.";

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#EEF3F8;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#EEF3F8;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:separate;border-spacing:0;">
            <tr>
              <td style="padding:0 0 14px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#17324D;">DR-DOCSCOL</td>
                    <td align="right" style="font-size:12px;color:#718096;">Documents scolaires</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#FFFFFF;border:1px solid #DDE7F0;border-radius:20px;overflow:hidden;box-shadow:0 18px 45px rgba(23,50,77,.10);">
                <div style="height:7px;background:${tone.accent};"></div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:34px 34px 10px;">
                      <span style="display:inline-block;margin-bottom:18px;padding:8px 12px;border-radius:999px;background:${tone.accentSoft};color:${tone.accent};font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(input.eyebrow ?? tone.label)}</span>
                      <h1 style="margin:0;color:#102A43;font-size:28px;line-height:1.18;font-weight:800;">${escapeHtml(input.title)}</h1>
                      ${
                        input.intro
                          ? `<p style="margin:16px 0 0;color:#46596A;font-size:16px;line-height:1.6;">${escapeHtml(input.intro)}</p>`
                          : ""
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 34px 8px;">
                      ${body ? paragraphHtml(body) : ""}
                      ${input.details ? renderDetails(input.details) : ""}
                      ${
                        input.cta
                          ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0 8px;"><tr><td><a href="${escapeHtml(resolveEmailHref(input.cta.href))}" style="display:inline-block;background:${tone.accent};color:#FFFFFF;text-decoration:none;border-radius:12px;padding:14px 20px;font-size:14px;font-weight:800;">${escapeHtml(input.cta.label)}</a></td></tr></table>`
                          : ""
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:22px 34px 32px;">
                      <div style="border-top:1px solid #E3EAF2;padding-top:18px;color:#718096;font-size:12px;line-height:1.6;">${escapeHtml(footerNote)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderTextEmailAsHtml(subject: string, text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const intro = paragraphs[0] ?? subject;
  const body = paragraphs.slice(1);

  return renderBrandedEmail({
    title: subject,
    intro,
    body,
    tone: "info",
  });
}
