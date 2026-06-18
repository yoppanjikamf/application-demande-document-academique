import type { NextConfig } from "next";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin =
  supabaseUrl && (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))
    ? new URL(supabaseUrl).origin
    : null;

const supabaseRemotePattern =
  supabaseUrl && (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))
    ? (() => {
        const parsed = new URL(supabaseUrl);
        return {
          protocol: parsed.protocol.replace(":", "") as "http" | "https",
          hostname: parsed.hostname,
          port: parsed.port || undefined,
          pathname: "/storage/v1/object/**",
        };
      })()
    : null;
const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const isDevelopment = process.env.NODE_ENV !== "production";
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
const shouldEnforceHttpsHeaders =
  process.env.NODE_ENV === "production" &&
  typeof publicSiteUrl === "string" &&
  publicSiteUrl.startsWith("https://");

function copyPrismaEnginesForServerless() {
  const sourceDir = join(process.cwd(), "lib", "generated", "prisma");
  const targetDir = join(process.cwd(), ".next", "server", "chunks");

  if (!existsSync(sourceDir)) {
    return;
  }

  const engineFiles = readdirSync(sourceDir).filter(
    (file) => file.startsWith("libquery_engine-") && file.endsWith(".so.node"),
  );

  if (engineFiles.length === 0) {
    return;
  }

  mkdirSync(targetDir, { recursive: true });

  for (const file of engineFiles) {
    copyFileSync(join(sourceDir, file), join(targetDir, file));
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  // Keep standalone only for Docker/VPS self-hosting. Vercel handles output internally.
  output: isVercel ? undefined : "standalone",
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/*": ["lib/generated/prisma/**/*", ".next/server/chunks/libquery_engine-*.so.node"],
  },
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/dashboard/rendezvous",
        destination: "/dashboard/rendez-vous",
        permanent: true,
      },
    ];
  },
  async headers() {
    const connectSrc = ["'self'", "https:", "wss:"];
    if (isDevelopment) {
      connectSrc.push("http:", "ws:");
    }
    if (supabaseOrigin) {
      connectSrc.push(supabaseOrigin);
    }

    const scriptSrc = ["'self'", "'unsafe-inline'"];
    if (isDevelopment) {
      // Next.js dev runtime needs eval/WebSocket for HMR and client hydration.
      scriptSrc.push("'unsafe-eval'");
    }

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data: https:",
      "media-src 'self' data: blob: https: http:",
      "style-src 'self' 'unsafe-inline'",
      "worker-src 'self' blob:",
      `script-src ${scriptSrc.join(" ")}`,
      `connect-src ${connectSrc.join(" ")}`,
      ...(shouldEnforceHttpsHeaders ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-site" },
    ];

    if (shouldEnforceHttpsHeaders) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      {
        protocol: "http",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      ...(supabaseRemotePattern ? [supabaseRemotePattern] : []),
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins.push({
        apply(compiler: { hooks: { afterEmit: { tap: (name: string, callback: () => void) => void } } }) {
          compiler.hooks.afterEmit.tap("CopyPrismaEnginesPlugin", copyPrismaEnginesForServerless);
        },
      });
    }

    return config;
  },

  experimental: {
    // Workaround for intermittent missing server chunks during production builds.
    webpackBuildWorker: false,
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
