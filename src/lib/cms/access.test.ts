import { describe, expect, it } from "vitest";
import { routeAccess } from "@/lib/cms/access";

const visitor = { isSignedIn: false, isAdmin: false, hasSiteUrl: true };
const signedIn = { isSignedIn: true, isAdmin: false, hasSiteUrl: true };
const admin = { isSignedIn: true, isAdmin: true, hasSiteUrl: true };

describe("routeAccess", () => {
  it("sends visitors of public pages to the school site", () => {
    expect(routeAccess({ pathname: "/programs/bscs", ...visitor })).toBe(
      "site",
    );
    expect(routeAccess({ pathname: "/", ...signedIn })).toBe("site");
  });

  it("lets admins see public pages, for previews", () => {
    expect(
      routeAccess({ pathname: "/news-announcements/news/x", ...admin }),
    ).toBe("allow");
  });

  it("sends signed-out visitors of the CMS to the login page", () => {
    expect(routeAccess({ pathname: "/admin/posts", ...visitor })).toBe("login");
    expect(routeAccess({ pathname: "/admin", ...visitor })).toBe("login");
  });

  it("always allows the login page", () => {
    expect(routeAccess({ pathname: "/admin/login", ...visitor })).toBe("allow");
  });

  it("lets signed-in users into the CMS (pages check the admin role)", () => {
    expect(routeAccess({ pathname: "/admin", ...signedIn })).toBe("allow");
  });

  it("does not treat lookalike paths as the CMS", () => {
    expect(routeAccess({ pathname: "/administration", ...visitor })).toBe(
      "site",
    );
  });

  it("serves public pages to everyone when there is no school site to send them to (local dev)", () => {
    expect(
      routeAccess({ pathname: "/programs", ...visitor, hasSiteUrl: false }),
    ).toBe("allow");
    expect(
      routeAccess({ pathname: "/admin", ...visitor, hasSiteUrl: false }),
    ).toBe("login");
  });
});
