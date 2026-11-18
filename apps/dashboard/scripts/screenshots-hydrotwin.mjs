/**
 * Screenshot Simulator, panel peringatan EWS, dan PWA warga.
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
const CHROME =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const jeda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function peringatanContoh() {
  const sekarang = new Date();
  const iso = sekarang.toISOString();
  const berlakuHingga = new Date(sekarang.getTime() + 6 * 60 * 60 * 1000).toISOString();
  return {
    id: "PRG-kampung_melayu-demo",
    wilayahKode: "kampung_melayu",
    wilayahNama: "Kampung Melayu",
    nodeId: "kampung_melayu",
    level: "siaga",
    debitKumulatifM3s: 3200,
    kedalamanM: null,
    estimasiTibaMenit: 60,
    puncakJam: 3,
    keyakinan: 92,
    teksAwal:
      "ALERT — Kelurahan Kampung Melayu. Estimated water arrival in about 60 minutes. Peak around 3 hours. Move to an upper floor or the nearest safe location. Follow official information from BPBD DKI Jakarta.",
    teksFinal:
      "ALERT — Kelurahan Kampung Melayu. Estimated water arrival in about 60 minutes. Peak around 3 hours. Move to an upper floor or the nearest safe location. Follow official information from BPBD DKI Jakarta.",
    sumberNarasi: "llm",
    modelLabel: "OpenAI (mock)",
    status: "disiarkan",
    dibuatPada: iso,
    narasiDibuatPada: iso,
    alasanFallback: null,
    disuntingPada: null,
    disiarkanPada: iso,
    disiarkanOleh: "Operator demo",
    ditarikPada: null,
    ditolakPada: null,
    kedaluwarsaPada: null,
    berlakuHingga,
    versiSimulasi: iso,
  };
}

async function klikTeks(halaman, label) {
  const ditemukan = await halaman.evaluate((teks) => {
    const tombol = [...document.querySelectorAll("button")].find((item) =>
      item.innerText.includes(teks),
    );
    if (!tombol) return false;
    tombol.click();
    return true;
  }, label);
  if (!ditemukan) throw new Error(`Tombol "${label}" tidak ditemukan`);
}

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

  // ---- Simulator
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });
  await page.goto(`${BASE}/rencana`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate(() => localStorage.setItem("hydrograph-theme", "light"));
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => document.body.innerText.includes("Scenario interpretation"), {
    timeout: 60_000,
  });
  await page.waitForFunction(() => document.body.innerText.includes("AI · Claude (mock)"), {
    timeout: 30_000,
  });
  await klikTeks(page, "Generate brief");
  await page.waitForFunction(() => document.body.innerText.includes("## Summary"), {
    timeout: 30_000,
  });
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
  await jeda(1_500);

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

  // ---- Panel peringatan EWS
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });
  await page.goto(`${BASE}/ops`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate(() => localStorage.removeItem("hydrotwin-peringatan-publik-v1"));
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => document.body.innerText.includes("Tactical recommendation"), {
    timeout: 60_000,
  });
  const slider = await page.$('[role="slider"]');
  if (!slider) throw new Error("Slider hujan tidak ditemukan");
  await slider.focus();
  await page.keyboard.press("End");
  await jeda(1_200);
  await klikTeks(page, "Review public alerts");
  await page.waitForSelector("#teks-peringatan", { timeout: 15_000 });
  await page.waitForFunction(() => document.body.innerText.includes("AI · OpenAI (mock)"), {
    timeout: 20_000,
  });
  await jeda(600);
  await page.screenshot({
    path: path.join(tujuan, "08-panel-peringatan.png"),
    clip: { x: 0, y: 0, width: 1440, height: 1000 },
  });
  console.log("08-panel-peringatan.png", 1000);

  // ---- PWA warga
  await page.setViewport({ width: 430, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/warga`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate((item) => {
    localStorage.setItem(
      "hydrotwin-peringatan-publik-v1",
      JSON.stringify({ diperbaruiPada: item.disiarkanPada, peringatan: [item] }),
    );
  }, peringatanContoh());
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(
    () => document.body.innerText.includes("Official alert from BPBD operator"),
    { timeout: 15_000 },
  );
  await jeda(800);

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
