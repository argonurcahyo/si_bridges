import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import type { KelurahanFeature } from "@/engine/planner";
import { usePlanner } from "@/hooks/usePlanner";
import { teks } from "@/i18n/id";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOperatorStore } from "@/store/operatorStore";

const NAMA = "Kampung Melayu";

function cincin(feature: KelurahanFeature | undefined): [number, number][][] {
  if (!feature) return [];
  const { geometry } = feature;
  const poligon =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return poligon.map((poly) => poly[0] as [number, number][]);
}

function PetaMini({ feature }: { feature?: KelurahanFeature }) {
  const rings = cincin(feature);
  if (rings.length === 0) {
    return (
      <div className="bg-muted/40 flex h-40 items-center justify-center rounded-xl border">
        <MapPin className="text-muted-foreground size-6" aria-hidden="true" />
      </div>
    );
  }

  const semua = rings.flat();
  const lng = semua.map(([x]) => x);
  const lat = semua.map(([, y]) => y);
  const minX = Math.min(...lng);
  const maxX = Math.max(...lng);
  const minY = Math.min(...lat);
  const maxY = Math.max(...lat);
  const w = Math.max(maxX - minX, 1e-4);
  const h = Math.max(maxY - minY, 1e-4);
  const pad = 0.08;
  const titik = (ring: [number, number][]) =>
    ring
      .map(([x, y]) => `${(x - minX + w * pad).toFixed(5)},${(maxY - y + h * pad).toFixed(5)}`)
      .join(" ");

  const utama = rings[0];
  const pusatX =
    utama.reduce((jumlah, [x]) => jumlah + x, 0) / utama.length - minX + w * pad;
  const pusatY =
    maxY - utama.reduce((jumlah, [, y]) => jumlah + y, 0) / utama.length + h * pad;
  const radius = Math.max(w, h) * 0.025;

  return (
    <div className="relative h-40 overflow-hidden rounded-xl border bg-sky-50 dark:bg-slate-900">
      <svg
        viewBox={`0 0 ${w * (1 + pad * 2)} ${h * (1 + pad * 2)}`}
        className="h-full w-full"
        role="img"
        aria-label={`Batas ${NAMA}`}
      >
        {rings.map((ring, i) => (
          <polygon
            key={i}
            points={titik(ring)}
            fill="#fbbf24"
            fillOpacity={0.55}
            stroke="#d97706"
            strokeWidth={Math.max(w, h) * 0.008}
          />
        ))}
        <circle cx={pusatX} cy={pusatY} r={radius * 2.2} fill="#0f172a" fillOpacity={0.15} />
        <circle
          cx={pusatX}
          cy={pusatY}
          r={radius}
          fill="#0f172a"
          stroke="#ffffff"
          strokeWidth={radius * 0.7}
        />
      </svg>
      <span className="absolute top-2 left-0 right-0 text-center text-[11px] text-slate-600 dark:text-slate-300">
        posisi Anda
      </span>
      <span className="bg-background/90 absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]">
        <MapPin className="size-3 text-sky-600" aria-hidden="true" />
        {NAMA}
      </span>
    </div>
  );
}

export function WargaPage() {
  const { hasil, kelurahan, memuat } = usePlanner();
  const disetujui = useOperatorStore((state) =>
    Object.values(state.keputusan).some((pilihan) => pilihan === "diterima"),
  );

  const item = hasil?.perKelurahan.find((k) => k.kelurahan === NAMA);
  const feature = kelurahan?.find((f) => f.properties.kelurahan === NAMA);
  const level = item?.level ?? "aman";
  const kedalaman = item?.kedalamanM ?? 0;
  const bawah = Math.max(0, Math.round((kedalaman - 0.12) * 100));
  const atas = Math.round((kedalaman + 0.18) * 100);
  const jam = hasil?.ringkasan.puncakJam ?? 3;

  const levelTeks = level === "siaga" ? "SIAGA 2" : level === "waspada" ? "WASPADA" : "AMAN";

  return (
    <div className="min-h-dvh bg-slate-100 px-3 py-4 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            to="/rencana"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {teks.warga.kembali}
          </Link>
          <span className="rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {teks.warga.pratinjau}
          </span>
        </div>

        <div className="bg-background overflow-hidden rounded-[2rem] border shadow-xl">
          <header className="border-b px-5 py-4 text-center">
            <p className="text-lg font-semibold tracking-tight">{teks.warga.judul}</p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">{teks.warga.lokasi}</p>
          </header>

          <div className="space-y-4 p-4">
            <section
              className={cn(
                "rounded-2xl p-5 text-center text-white shadow-sm",
                level === "siaga"
                  ? "bg-gradient-to-br from-amber-500 to-orange-600"
                  : level === "waspada"
                    ? "bg-gradient-to-br from-amber-400 to-amber-600"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600",
              )}
              aria-live="polite"
            >
              <p className="text-3xl font-extrabold tracking-wide">{levelTeks}</p>
              <p className="mt-2 text-sm">
                {teks.warga.genangan} {bawah}–{atas} cm
              </p>
              <p className="mt-1 text-xs opacity-90">
                {teks.warga.puncak.replace("{jam}", formatAngka(jam, 1))}
              </p>
            </section>

            <PetaMini feature={feature} />

            <div className="text-muted-foreground flex justify-between text-[11px]">
              <span>
                {teks.warga.keyakinan} {hasil?.ringkasan.keyakinan ?? "—"}%
              </span>
              <span>{teks.warga.tanpaLokasi}</span>
            </div>

            <section>
              <p className="mb-2 text-sm font-semibold">{teks.warga.langkah}</p>
              <ol className="space-y-2.5">
                {[
                  [teks.warga.langkah1, undefined],
                  [teks.warga.langkah2, undefined],
                  [teks.warga.langkah3, teks.warga.langkah3Catatan],
                ].map(([judul, catatan], i) => (
                  <li key={judul} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-xs leading-snug">
                      {judul}
                      {catatan ? (
                        <span className="text-muted-foreground block text-[10px]">{catatan}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs font-semibold">{teks.warga.arti}</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                {teks.warga.artiTeks}
              </p>
            </section>

            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold",
                disetujui
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
              )}
            >
              {disetujui ? (
                <ShieldCheck className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )}
              {disetujui ? teks.warga.disetujui : teks.warga.menunggu}
            </div>

            <p className="text-muted-foreground pb-1 text-center text-[10px]">
              {memuat ? teks.planner.memuat : teks.warga.catatan}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
