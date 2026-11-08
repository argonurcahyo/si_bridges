/**
 * Screenshot Konsol Perencana dan PWA Warga.
 *
 * Jalankan dev server port 5174, lalu:
 *   node scripts/screenshots-hydrotwin.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tujuan = path.resolve(root, "..", "..", "docs", "ui-prototype", "screenshots");
const BASE = "http://localhost:5174";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const jeda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      "--no-sandbox",
      "--ignore-gpu-blocklist",
      "--enable-unsafe-swiftshader",
      "--use-gl=angle",
    ],
  });

  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

  // ---- Konsol perencana
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });
  await page.goto(`${BASE}/rencana`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate(() => localStorage.setItem("hydrograph-theme", "light"));
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector(".maplibregl-canvas", { timeout: 60_000 });
  await page.waitForFunction(() => document.body.innerText.includes("Executive Brief"), {
    timeout: 60_000,
  });

  await jeda(1500);
  await page
    .waitForFunction(
      () => {
        const map = window.__hydrotwinMap;
        if (!map || !map.getLayer("kelurahan-fill")) return false;
        return map.queryRenderedFeatures({ layers: ["kelurahan-fill"] }).length > 0;
      },
      { timeout: 45_000 },
    )
    .catch(() => console.warn("Layer kelurahan belum terdeteksi, lanjut screenshot"));
  await jeda(1500);

  const tinggi = await page.evaluate(() => {
    const footer = document.querySelector("footer");
    const bawah = footer?.getBoundingClientRect().bottom ?? document.body.scrollHeight;
    return Math.ceil(bawah + window.scrollY + 20);
  });

  await page.screenshot({
    path: path.join(tujuan, "12-konsol-perencana.png"),
    clip: { x: 0, y: 0, width: 1440, height: tinggi },
  });
  console.log("12-konsol-perencana.png", tinggi);

  // ---- PWA warga
  await page.setViewport({ width: 430, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/warga`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => document.body.innerText.includes("SIAGA"), {
    timeout: 60_000,
  });
  await jeda(2500);

  const tinggiWarga = await page.evaluate(() => {
    const kartu = [...document.querySelectorAll("div")].find(
      (el) => el.textContent.includes("HydroTwin Siaga") && el.className.includes("rounded-[2rem]"),
    );
    return Math.ceil((kartu?.getBoundingClientRect().bottom ?? 860) + 20);
  });

  await page.screenshot({
    path: path.join(tujuan, "11-warga-pwa.png"),
    clip: { x: 0, y: 0, width: 430, height: tinggiWarga },
  });
  console.log("11-warga-pwa.png", tinggiWarga);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
