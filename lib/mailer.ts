import nodemailer from "nodemailer";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }

  return value;
}

export function createMailerTransport() {
  const port = Number(requiredEnv("SMTP_PORT"));
  const secure = process.env.SMTP_SECURE === "true" || (!process.env.SMTP_SECURE && port === 465);

  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port,
    secure,
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASSWORD"),
    },
  });
}

export async function sendMail({
  to,
  subject,
  text,
  html,
  fromName,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string;
}) {
  const transport = createMailerTransport();
  const defaultFrom = requiredEnv("SMTP_FROM");
  const fromAddress = defaultFrom.match(/<(.+)>/)?.[1] ?? defaultFrom;
  const from = fromName ? `${fromName} <${fromAddress}>` : defaultFrom;

  return transport.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
