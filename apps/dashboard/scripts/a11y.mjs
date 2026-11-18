/**
 * Audit aksesibilitas dengan axe-core.
 *
 * Menjalankan dev server sendiri di port 5181, lalu memeriksa:
 * - /ops (dasar dan sheet peringatan)
 * - /warga dengan peringatan aktif
 * - /rencana dengan interpretasi dan Executive Brief
 *
 *   pnpm audit:a11y
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.resolve(root, "..", "..", "docs", "ui-prototype");
const PORT = 5181;
const BASE = `http://localhost:${PORT}`;
const CHROME =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const isWindows = process.platform === "win32";
const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

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
      // belum siap
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
    const tombol = [...document.querySelectorAll("button")].find((item) =>
      item.innerText.includes(teks),
    );
    if (!tombol) return false;
    tombol.click();
    return true;
  }, label);
  if (!ditemukan) throw new Error(`Tombol "${label}" tidak ditemukan`);
}

async function audit(page, nama) {
  await page.addScriptTag({ path: axePath });
  const hasil = await page.evaluate(async () =>
    window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    }),
  );

  const pelanggaran = hasil.violations.map((item) => ({
    id: item.id,
    impact: item.impact,
    help: item.help,
    nodes: item.nodes.length,
    targets: item.nodes.slice(0, 3).map((node) => node.target.join(" ")),
  }));

  return { nama, pelanggaran };
}

function peringatan(pelanggaran) {
  return pelanggaran.filter((item) => item.impact === "serious" || item.impact === "critical");
}

async function main() {
  const server = jalankanServer();
  let browser;

  try {
    await tungguServer();
    browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: true,
      args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    const hasil = [];

    await page.goto(`${BASE}/ops`, { waitUntil: "networkidle2", timeout: 60_000 });
    await page.waitForFunction(() => document.body.innerText.includes("Tactical recommendation"), {
      timeout: 30_000,
    });
    hasil.push(await audit(page, "Operator /ops — dasar"));

    await page.evaluate(() => localStorage.setItem("hydrograph-theme", "dark"));
    await page.reload({ waitUntil: "networkidle2", timeout: 60_000 });
    await page.waitForFunction(() => document.body.innerText.includes("Tactical recommendation"), {
      timeout: 30_000,
    });
    hasil.push(await audit(page, "Operator /ops — tema gelap"));
    await page.evaluate(() => localStorage.setItem("hydrograph-theme", "light"));
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
    hasil.push(await audit(page, "Operator /ops — sheet peringatan"));

    const now = new Date();
    const iso = now.toISOString();
    const berlaku = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
    const peringatanAktif = {
      id: "PRG-kampung_melayu-a11y",
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
        "ALERT — Kelurahan Kampung Melayu. Water is expected to arrive in about 60 minutes. Move to an upper floor or the nearest safe location.",
      teksFinal:
        "ALERT — Kelurahan Kampung Melayu. Water is expected to arrive in about 60 minutes. Move to an upper floor or the nearest safe location.",
      sumberNarasi: "template",
      modelLabel: "Template HydroTwin",
      status: "disiarkan",
      dibuatPada: iso,
      narasiDibuatPada: null,
      alasanFallback: null,
      disuntingPada: null,
      disiarkanPada: iso,
      disiarkanOleh: "Operator demo",
      ditarikPada: null,
      ditolakPada: null,
      kedaluwarsaPada: null,
      berlakuHingga: berlaku,
      versiSimulasi: iso,
    };

    await page.goto(`${BASE}/warga`, { waitUntil: "networkidle2", timeout: 60_000 });
    await page.evaluate((item) => {
      localStorage.setItem(
        "hydrotwin-peringatan-publik-v1",
        JSON.stringify({ diperbaruiPada: item.disiarkanPada, peringatan: [item] }),
      );
    }, peringatanAktif);
    await page.reload({ waitUntil: "networkidle2", timeout: 60_000 });
    await page.waitForFunction(
      () => document.body.innerText.includes("Official alert from BPBD operator"),
      { timeout: 10_000 },
    );
    hasil.push(await audit(page, "Warga /warga — peringatan aktif"));

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
    hasil.push(await audit(page, "Simulator /rencana — interpretasi & brief"));

    const serius = hasil.flatMap((item) =>
      peringatan(item.pelanggaran).map((pelanggaran) => ({ ...pelanggaran, halaman: item.nama })),
    );

    const baris = hasil
      .map((item) => {
        if (item.pelanggaran.length === 0) return `| ${item.nama} | 0 | — |`;
        return item.pelanggaran
          .map(
            (pelanggaran) =>
              `| ${item.nama} | ${pelanggaran.impact ?? "-"} | ${pelanggaran.id} (${pelanggaran.nodes} node) |`,
          )
          .join("\n");
      })
      .join("\n");

    const laporan = [
      "# Laporan Audit Aksesibilitas",
      "",
      `Tanggal: ${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date())}`,
      "Alat: axe-core 4.14.1, WCAG 2.1 A/AA.",
      "Cakupan: /ops, sheet peringatan, /warga dengan peringatan aktif, /rencana dengan interpretasi dan brief.",
      "",
      "## Ringkasan",
      "",
      `- Target diperiksa: ${hasil.length}`,
      `- Pelanggaran serious/critical: ${serius.length}`,
      "",
      "| Halaman | Dampak | Aturan |",
      "|---|---|---|",
      baris,
      "",
      "## Temuan Serious/Critical",
      "",
      serius.length === 0
        ? "Tidak ada pelanggaran serious atau critical."
        : serius
            .map(
              (item) =>
                `- **${item.id}** (${item.halaman}, ${item.impact}): ${item.help}. Target: ${item.targets.join(", ")}`,
            )
            .join("\n"),
      "",
      "## Catatan",
      "",
      "- Peta MapLibre dan canvas tidak dapat diperiksa sepenuhnya oleh axe; alternatif tabel dan label tetap disediakan.",
      "- Audit ini tidak menggantikan uji keyboard manual dan uji dengan screen reader.",
      "",
    ].join("\n");

    await mkdir(docs, { recursive: true });
    await writeFile(path.join(docs, "a11y-report.md"), laporan, "utf8");

    console.log(
      JSON.stringify({ ok: serius.length === 0, target: hasil.length, serius: serius.length }),
    );
    if (serius.length > 0) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    hentikanServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
