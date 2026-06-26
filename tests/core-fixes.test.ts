import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAdminRegionalScope } from "../lib/admin-scope";
import { normalizeRegion } from "../lib/document-routing";
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
