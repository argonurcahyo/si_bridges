/**
 * Mengambil screenshot prototipe untuk dokumentasi.
 *
 * Jalankan dev server lebih dulu (port 5174), lalu:
 *   node scripts/screenshots.mjs
 *
 * Output: ../../docs/ui-prototype/screenshots/*.png
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tujuan = path.resolve(root, "..", "..", "docs", "ui-prototype", "screenshots");
const URL = "http://localhost:5174/ops";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const jeda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function cariSection(page, judul) {
  const daftar = await page.$$("section");
  for (const el of daftar) {
    const teks = await el.evaluate((node) => node.innerText);
    if (teks.includes(judul)) return el;
  }
  throw new Error(`Section "${judul}" tidak ditemukan`);
}

async function klikTeks(page, teks) {
  const ditemukan = await page.evaluate((label) => {
    const kandidat = [...document.querySelectorAll("button,[role=tab],[role=radio]")];
    const el = kandidat.find((item) => item.textContent.trim() === label);
    if (!el) return false;
    el.click();
    return true;
  }, teks);
  if (!ditemukan) throw new Error(`Tombol "${teks}" tidak ditemukan`);
  await jeda(500);
}

async function siapkanPeta(page) {
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  await jeda(900);
}

async function tutupDialog(page) {
  await page.keyboard.press("Escape");
  await jeda(500);
}

async function potretSampai(page, handle, mode, nama) {
  const clip = await handle.evaluate((el, jenis) => {
    const rect = el.getBoundingClientRect();
    let bawah = rect.bottom;

    if (jenis === "draft") {
      const tombol = [...el.querySelectorAll("button")].find((node) =>
        node.textContent.includes("Draf peringatan publik"),
      );
      if (tombol) bawah = tombol.getBoundingClientRect().bottom;
    } else if (jenis === "teks") {
      const node = [...el.querySelectorAll("p,li,dd,dt,button")].filter(
        (item) => item.getBoundingClientRect().height > 0,
      );
      if (node.length > 0) {
        bawah = Math.max(...node.map((item) => item.getBoundingClientRect().bottom));
      }
    } else {
      const item = el.querySelectorAll('[role="tabpanel"] li');
      if (item.length > 0) bawah = item[item.length - 1].getBoundingClientRect().bottom;
    }

    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: Math.max(120, bawah - rect.top + 14),
    };
  }, mode);

  await page.screenshot({ path: path.join(tujuan, nama), clip });
  console.log(nama);
}

async function main() {
  await mkdir(tujuan, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      "--no-sandbox",
      "--ignore-gpu-blocklist",
      "--enable-unsafe-swiftshader",
      "--use-gl=angle",
      "--window-size=1440,1000",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate(() => localStorage.setItem("hydrograph-theme", "light"));
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("canvas", { timeout: 60_000 });
  await jeda(4000);

  const ambil = async (nama, opsi = {}) => {
    const berkas = path.join(tujuan, nama);
    await page.screenshot({ path: berkas, ...opsi });
    console.log(nama);
  };

  // 1. Keseluruhan halaman
  await ambil("01-overview.png", { fullPage: true });

  // 2. Panel simulasi
  await potretSampai(
    page,
    await cariSection(page, "Intensitas hujan"),
    "teks",
    "02-panel-simulasi.png",
  );

  // 3. Peta
  await siapkanPeta(page);
  await potretSampai(
    page,
    await cariSection(page, "Peta jaringan pemantauan"),
    "teks",
    "03-panel-peta.png",
  );

  // 4. Grafik
  await potretSampai(
    page,
    await cariSection(page, "Debit per node"),
    "teks",
    "04-panel-grafik.png",
  );

  // 5. Rekomendasi
  await potretSampai(
    page,
    await cariSection(page, "Rekomendasi taktis"),
    "draft",
    "05-panel-rekomendasi.png",
  );
  console.log("05-panel-rekomendasi.png");

  // 6. Keputusan + log audit
  await klikTeks(page, "Perlu Verifikasi");
  await page.evaluate(() => {
    const tab = [...document.querySelectorAll("[role=tab]")].find(
      (el) => el.textContent.trim() === "Log keputusan",
    );
    tab?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    tab?.click();
  });
  await jeda(600);
  await potretSampai(
    page,
    await cariSection(page, "Rekomendasi taktis"),
    "log",
    "06-log-keputusan.png",
  );
  console.log("06-log-keputusan.png");

  // Kembali ke tab Narasi agar tombol draf tersedia lagi.
  await page.evaluate(() => {
    const tab = [...document.querySelectorAll("[role=tab]")].find(
      (el) => el.textContent.trim() === "Narasi",
    );
    tab?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    tab?.click();
  });
  await jeda(600);

  // 7. Detail node
  await page.evaluate(() => {
    const tombol = [...document.querySelectorAll("button")].find(
      (el) => el.textContent.trim() === "Pintu Air Manggarai",
    );
    tombol?.click();
  });
  await page.waitForSelector("[role=dialog]", { timeout: 10_000 });
  await jeda(600);
  await (
    await page.$("[role=dialog]")
  ).screenshot({
    path: path.join(tujuan, "07-detail-node.png"),
  });
  console.log("07-detail-node.png");
  await tutupDialog(page);

  // 8. Draf peringatan publik
  await klikTeks(page, "Draf peringatan publik");
  await page.waitForSelector("[role=dialog]", { timeout: 10_000 });
  await jeda(600);
  await (
    await page.$("[role=dialog]")
  ).screenshot({
    path: path.join(tujuan, "08-draf-peringatan.png"),
  });
  console.log("08-draf-peringatan.png");
  await tutupDialog(page);

  // 9. Status data & layanan
  await klikTeks(page, "Status");
  await page.waitForSelector("[role=dialog]", { timeout: 10_000 });
  await jeda(600);
  await (
    await page.$("[role=dialog]")
  ).screenshot({
    path: path.join(tujuan, "09-status-data.png"),
  });
  console.log("09-status-data.png");
  await tutupDialog(page);

  // 10. Mode 3D
  await klikTeks(page, "3D");
  await jeda(3500);
  await siapkanPeta(page);
  await potretSampai(
    page,
    await cariSection(page, "Peta jaringan pemantauan"),
    "teks",
    "10-mode-3d.png",
  );

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
