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

  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port,
    secure: process.env.SMTP_SECURE !== "false",
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
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const transport = createMailerTransport();

  return transport.sendMail({
    from: requiredEnv("SMTP_FROM"),
    to,
    subject,
    text,
    html,
  });
}
