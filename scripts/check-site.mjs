// End-to-end check of the static public site (`out/`, from `npm run build:site`)
// on a real Apache, the way the school server will serve it, with live content
// from Supabase. Needs Docker and Google Chrome.
//
//   npm run check:site            # serves out/ on http://localhost:18080
//   KEEP=1 npm run check:site     # leave the server running afterwards
//   CHROME_PATH=/path/to/chrome npm run check:site

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const PORT = 18080;
const BASE = `http://localhost:${PORT}`;
const CONTAINER = "cict-site-check";
const OUT_DIR = path.resolve("out");
const CHROME_PATH = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!existsSync(path.join(OUT_DIR, ".htaccess"))) {
  console.error("out/.htaccess not found. Run `npm run build:site` first.");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.",
  );
  process.exit(1);
}

const docker = (...args) => execFileSync("docker", args, { encoding: "utf8" });

/** Apache's stock config with mod_rewrite on and .htaccess files allowed. */
function apacheConfig() {
  const conf = docker(
    "run",
    "--rm",
    "httpd:2.4",
    "cat",
    "/usr/local/apache2/conf/httpd.conf",
  )
    .replace(/^#(LoadModule rewrite_module)/m, "$1")
    .replace(
      /(<Directory "\/usr\/local\/apache2\/htdocs">[\s\S]*?)AllowOverride None/,
      "$1AllowOverride All",
    );
  const file = path.join(
    mkdtempSync(path.join(tmpdir(), "cict-site-check-")),
    "httpd.conf",
  );
  writeFileSync(file, conf);
  return file;
}

function startApache() {
  docker("rm", "-f", CONTAINER);
  docker(
    "run",
    "-d",
    "--name",
    CONTAINER,
    "-p",
    `${PORT}:80`,
    "-v",
    `${OUT_DIR}:/usr/local/apache2/htdocs:ro`,
    "-v",
    `${apacheConfig()}:/usr/local/apache2/conf/httpd.conf:ro`,
    "httpd:2.4",
  );
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      await fetch(BASE);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Apache didn't start on ${BASE}`);
}

/** Reads published content the same way the site does (publishable key, RLS). */
async function firstRow(table, query) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${query}&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );
  const [row] = await response.json();
  if (!row) throw new Error(`No published ${table} to check against`);
  return row;
}

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

const results = [];
async function check(name, run) {
  try {
    await run();
    results.push(true);
    console.log(`ok    ${name}`);
  } catch (error) {
    results.push(false);
    console.log(`FAIL  ${name}\n      ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function pageText(page, text) {
  await page
    .waitForFunction(
      (t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()),
      { timeout: 15000 },
      text,
    )
    .catch(() => {
      throw new Error(`"${text}" never appeared on ${page.url()}`);
    });
}

startApache();
let browser;
try {
  await waitForServer();
  const post = await firstRow(
    "posts",
    "select=slug,title&order=published_at.desc",
  );
  const program = await firstRow("programs", "select=id,name&order=sort_order");
  const department = await firstRow(
    "departments",
    "select=slug,name&order=sort_order",
  );

  browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await check("a post opens from a direct link", async () => {
    await page.goto(`${BASE}/news-announcements/news/${post.slug}`, {
      waitUntil: "networkidle0",
    });
    await pageText(page, post.title);
  });

  await check(
    "a post opens from the home page without a full reload",
    async () => {
      await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
      await page.waitForSelector('a[href*="/news-announcements/news/"]', {
        visible: true,
      });
      const href = await page.evaluate(() => {
        const link = [
          ...document.querySelectorAll('a[href*="/news-announcements/news/"]'),
        ].find((a) => a.offsetParent !== null);
        window.__beforeClick = true;
        link.click();
        return link.getAttribute("href");
      });
      const slug = href.split("/").filter(Boolean).pop();
      const target = await firstRow(
        "posts",
        `select=title&slug=eq.${encodeURIComponent(slug)}`,
      );
      await pageText(page, target.title);
      expect(
        new URL(page.url()).pathname.replace(/\/$/, "") ===
          `/news-announcements/news/${slug}`,
        `URL is ${page.url()}`,
      );
      expect(
        await page.evaluate(() => window.__beforeClick === true),
        "the page fully reloaded",
      );
    },
  );

  await check("an unknown post shows Article Not Found", async () => {
    await page.goto(`${BASE}/news-announcements/news/does-not-exist`, {
      waitUntil: "networkidle0",
    });
    await pageText(page, "Article Not Found");
  });

  await check("the template URL itself shows Article Not Found", async () => {
    await page.goto(`${BASE}/news-announcements/news/_/`, {
      waitUntil: "networkidle0",
    });
    await pageText(page, "Article Not Found");
  });

  await check(
    "program and department pages open from direct links",
    async () => {
      await page.goto(`${BASE}/programs/${program.id}`, {
        waitUntil: "networkidle0",
      });
      await pageText(page, program.name);
      await page.goto(`${BASE}/faculty-profiles/${department.slug}`, {
        waitUntil: "networkidle0",
      });
      await pageText(page, department.name);
    },
  );

  await check("unknown pages return HTTP 404", async () => {
    const response = await fetch(`${BASE}/nope/`);
    expect(response.status === 404, `got HTTP ${response.status}`);
  });

  await check("no secret key in the upload", async () => {
    const secret = process.env.SUPABASE_SECRET_KEY;
    expect(secret, "SUPABASE_SECRET_KEY isn't set, so this can't be checked");
    const leaks = filesUnder(OUT_DIR).filter((file) =>
      readFileSync(file, "utf8").includes(secret),
    );
    expect(leaks.length === 0, `found in ${leaks.join(", ")}`);
  });
} finally {
  await browser?.close();
  if (process.env.KEEP)
    console.log(
      `\nStill serving on ${BASE} (docker rm -f ${CONTAINER} to stop)`,
    );
  else docker("rm", "-f", CONTAINER);
}

const failures = results.filter((ok) => !ok).length;
console.log(
  failures
    ? `\n${failures} check(s) failed`
    : `\nAll ${results.length} checks passed`,
);
process.exit(failures ? 1 : 0);
