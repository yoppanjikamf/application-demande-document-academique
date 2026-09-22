import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAdminRegionalScope } from "../lib/admin-scope";
import { normalizeRegion } from "../lib/document-routing";
import { getClientKeyFromRequest } from "../lib/simple-rate-limit";
import { getAppBaseUrl } from "../lib/site-url";

describe("admin-scope", () => {
  it("blocks admin without regional antenne", () => {
    assert.deepEqual(
      getAdminRegionalScope({ organismeId: "org-obc", antenneRegionaleId: null }),
      { id: "__none__" },
    );
  });

  it("scopes admin with organisme and antenne", () => {
    assert.deepEqual(
      getAdminRegionalScope({
        organismeId: "org-obc",
        antenneRegionaleId: "antenne-centre",
      }),
      { organismeId: "org-obc", antenneRegionaleId: "antenne-centre" },
    );
  });
});

describe("site-url", () => {
  it("prefers NEXT_PUBLIC_SITE_URL over APP_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://prod.example.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://legacy.example.com";
    assert.equal(getAppBaseUrl(), "https://prod.example.com");
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("falls back to NEXT_PUBLIC_APP_URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    assert.equal(getAppBaseUrl(), "https://app.example.com");
    delete process.env.NEXT_PUBLIC_APP_URL;
  });
});

describe("document-routing", () => {
  it("normalizes region names", () => {
    assert.equal(normalizeRegion("centre"), "Centre");
    assert.equal(normalizeRegion(undefined), "Centre");
  });
});

describe("rate-limit client key", () => {
  it("prefers Vercel forwarded IP over a spoofed X-Forwarded-For", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "1.1.1.1, 2.2.2.2",
        "x-vercel-forwarded-for": "9.9.9.9",
      },
    });
    assert.equal(getClientKeyFromRequest(request), "9.9.9.9");
  });

  it("uses the last X-Forwarded-For hop when Vercel headers are absent", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.1.1.1, 8.8.8.8" },
    });
    assert.equal(getClientKeyFromRequest(request), "8.8.8.8");
  });
});
