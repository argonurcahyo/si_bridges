/**
 * E2E HydroTwin-AI: EWS + Simulator.
 *
 * Menjalankan dev server sendiri di port 5180, lalu Chrome headless.
 *   pnpm test:e2e
 */

import { spawn } from "node:child_process";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 5180;
const BASE = `http://localhost:${PORT}`;
const CHROME =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const unduhan = path.join(os.tmpdir(), "hydrotwin-e2e-download");
const isWindows = process.platform === "win32";

function jalankanServer() {
  const args = ["dev", "--port", String(PORT), "--strictPort"];
  return isWindows
    ? spawn("cmd.exe", ["/c", "pnpm", ...args], { cwd: root, stdio: "ignore" })
    : spawn("pnpm", args, { cwd: root, stdio: "ignore" });
}

async function tungguServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      // server belum siap
    }
    await delay(500);
  }
  throw new Error(`Server tidak siap di ${BASE}`);
}

function hentikanServer(server) {
  if (!server || server.killed) return;
  if (isWindows) {
    spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  server.kill("SIGTERM");
}

async function klikTeks(page, label) {
  const ditemukan = await page.evaluate((teks) => {
    const tombol = [...document.querySelectorAll("button")].find(
      (item) => item.innerText.trim() === teks,
    );
    if (!tombol) return false;
    tombol.click();
    return true;
  }, label);
  if (!ditemukan) throw new Error(`Tombol "${label}" tidak ditemukan`);
}

async function main() {
  const server = jalankanServer();
  let browser;

  try {
    await tungguServer();
    await rm(unduhan, { recursive: true, force: true });
    await mkdir(unduhan, { recursive: true });

    browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: true,
      args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(`${BASE}/ops`, { waitUntil: "networkidle2", timeout: 60_000 });
    await page.evaluate(() => localStorage.removeItem("hydrotwin-peringatan-publik-v1"));
    await page.reload({ waitUntil: "networkidle2", timeout: 60_000 });
    await page.waitForFunction(() => document.body.innerText.includes("Tactical recommendation"), {
      timeout: 30_000,
    });

    const slider = await page.$('[role="slider"]');
    if (!slider) throw new Error("Slider hujan tidak ditemukan");
    await slider.focus();
    await page.keyboard.press("End");
    await delay(1_200);

    await klikTeks(page, "Review public alerts");
    await page.waitForSelector("#teks-peringatan", { timeout: 10_000 });
    await page.waitForFunction(() => document.body.innerText.includes("AI · OpenAI (mock)"), {
      timeout: 15_000,
    });

    await page.click("#teks-peringatan");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type("ALERT — E2E test message. Follow officer instructions.");

    await klikTeks(page, "Reject");
    await page.waitForFunction(() => document.body.innerText.includes("Alert rejected."), {
      timeout: 10_000,
    });

    const warga = await browser.newPage();
    await warga.setViewport({ width: 430, height: 900 });
    await warga.goto(`${BASE}/warga`, { waitUntil: "networkidle2", timeout: 60_000 });
    await warga.waitForFunction(
      () => document.body.innerText.includes("No official alert for this area yet."),
      { timeout: 10_000 },
    );

    await page.bringToFront();
    await klikTeks(page, "Publish to residents");
    await page.waitForFunction(
      () => document.body.innerText.includes("Alert published to residents."),
      {
        timeout: 10_000,
      },
    );

    await warga.reload({ waitUntil: "networkidle2", timeout: 60_000 });
    await warga.waitForFunction(
      () => document.body.innerText.includes("Official alert from BPBD operator"),
      { timeout: 10_000 },
    );
    const teksWarga = await warga.evaluate(() => document.body.innerText);
    if (!teksWarga.includes("E2E test message"))
      throw new Error("Teks hasil suntingan tidak tampil");
    if (!teksWarga.includes("OpenAI (mock)")) throw new Error("Provenance AI tidak tampil");

    await page.bringToFront();
    await klikTeks(page, "Retract");
    await warga.reload({ waitUntil: "networkidle2", timeout: 60_000 });
    await warga.waitForFunction(
      () => document.body.innerText.includes("No official alert for this area yet."),
      { timeout: 10_000 },
    );

    await page.evaluate(() => {
      const saklar = document.querySelector("#paksa-gagal");
      if (saklar instanceof HTMLElement) saklar.click();
    });
    await delay(200);
    await klikTeks(page, "Regenerate");
    await page.waitForFunction(
      () => document.body.innerText.includes("AI is unreachable. The message uses the template."),
      { timeout: 10_000 },
    );

    await page.goto(`${BASE}/rencana`, { waitUntil: "networkidle2", timeout: 60_000 });
    await page.waitForFunction(() => document.body.innerText.includes("Scenario interpretation"), {
      timeout: 30_000,
    });
    await page.waitForFunction(() => document.body.innerText.includes("AI · Claude (mock)"), {
      timeout: 15_000,
    });

    await klikTeks(page, "Generate brief");
    await page.waitForFunction(() => document.body.innerText.includes("## Summary"), {
      timeout: 15_000,
    });
    const brief = await page.evaluate(() => document.body.innerText);
    if (!brief.includes("## Limitations")) throw new Error("Struktur brief tidak lengkap");

    const client = await page.createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: unduhan,
    });
    await klikTeks(page, "Download Markdown");
    let berkas = [];
    for (let i = 0; i < 20; i += 1) {
      berkas = await readdir(unduhan);
      if (berkas.includes("executive-brief.md")) break;
      await delay(250);
    }
    if (!berkas.includes("executive-brief.md")) throw new Error("Brief Markdown tidak terunduh");
    const info = await stat(path.join(unduhan, "executive-brief.md"));
    if (info.size === 0) throw new Error("Brief Markdown kosong");

    await page.$eval('[role="slider"]', (el) => el.focus());
    await page.keyboard.press("End");
    await delay(1_200);
    await page.waitForFunction(
      () => document.body.innerText.includes("The scenario changed. Regenerate this brief."),
      { timeout: 10_000 },
    );

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60_000 }),
      klikTeks(page, "ID"),
    ]);
    await page.waitForFunction(() => document.body.innerText.includes("Konsol Perencana"), {
      timeout: 15_000,
    });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60_000 }),
      klikTeks(page, "EN"),
    ]);
    await page.waitForFunction(() => document.body.innerText.includes("Planner Console"), {
      timeout: 15_000,
    });

    console.log(
      JSON.stringify({
        ok: true,
        ews: "AI → edit → reject → publish → retract, fallback template",
        simulator: "AI interpretation, 5-part brief, Markdown download, stale brief",
        bahasa: "EN default, switch to ID, back to EN",
      }),
    );
  } finally {
    if (browser) await browser.close();
    hentikanServer(server);
    await rm(unduhan, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
