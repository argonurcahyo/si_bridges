import { ArrowLeft, Info, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { usePeringatanPublik } from "@/hooks/usePeringatanPublik";
import { teks } from "@/i18n/teks";
import { formatAngka, formatWaktuWib } from "@/lib/format";
import { cn } from "@/lib/utils";

const KELAS_LEVEL = {
  siaga: "bg-gradient-to-br from-amber-500 to-orange-600",
  waspada: "bg-gradient-to-br from-amber-400 to-amber-600",
} as const;

export function WargaPage() {
  const { aktif } = usePeringatanPublik();
  const [dipilih, setDipilih] = useState<string | null>(null);

  const terpilih = useMemo(
    () => aktif.find((item) => item.wilayahKode === dipilih) ?? aktif[0],
    [aktif, dipilih],
  );

  return (
    <div className="min-h-dvh bg-slate-100 px-3 py-4 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            to="/ops"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {teks.warga.kembali}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <span className="bg-background text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] font-medium">
              {teks.warga.pratinjau}
            </span>
          </div>
        </div>

        <div className="bg-background overflow-hidden rounded-[2rem] border shadow-xl">
          <header className="border-b px-5 py-4 text-center">
            <p className="text-lg font-semibold tracking-tight">{teks.warga.judul}</p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">{teks.warga.subjudul}</p>
          </header>

          {!terpilih ? (
            <div className="space-y-3 p-5 text-center">
              <div className="bg-muted/50 mx-auto grid size-12 place-items-center rounded-full">
                <Info className="text-muted-foreground size-6" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold">{teks.warga.belumAda}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {teks.warga.belumAdaCatatan}
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <p className="text-center text-sm font-semibold">{terpilih.wilayahNama}</p>

              {aktif.length > 1 ? (
                <div className="space-y-1.5">
                  <label htmlFor="wilayah-warga" className="text-xs font-medium">
                    {teks.warga.pilihWilayah}
                  </label>
                  <select
                    id="wilayah-warga"
                    value={terpilih.wilayahKode}
                    onChange={(event) => setDipilih(event.target.value)}
                    className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
                  >
                    {aktif.map((item) => (
                      <option key={item.wilayahKode} value={item.wilayahKode}>
                        {item.wilayahNama} · {teks.level[item.level]}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <section
                className={cn(
                  "rounded-2xl p-5 text-center text-white shadow-sm",
                  KELAS_LEVEL[terpilih.level],
                )}
                aria-live="polite"
              >
                <p className="text-3xl font-extrabold tracking-wide">
                  {teks.level[terpilih.level].toUpperCase()}
                </p>
                <p className="mt-2 text-sm">
                  {teks.warga.estimasi} ± {terpilih.estimasiTibaMenit ?? "—"} {teks.satuan.menit}
                </p>
                <p className="mt-1 text-xs opacity-90">
                  {teks.warga.puncak.replace("{jam}", formatAngka(terpilih.puncakJam, 1))}
                </p>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <RiskBadge level={terpilih.level} />
                  <ConfidenceBadge value={terpilih.keyakinan} />
                </div>
                <span className="text-muted-foreground text-[11px]">
                  {teks.warga.disiarkanPada}{" "}
                  {terpilih.disiarkanPada ? formatWaktuWib(new Date(terpilih.disiarkanPada)) : "—"}
                </span>
              </div>

              <section className="bg-muted/30 rounded-xl border p-3">
                <p className="mb-1.5 text-xs font-semibold">{teks.warga.teksPeringatan}</p>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{terpilih.teksFinal}</p>
                <p className="text-muted-foreground mt-2 text-[10px]">
                  {teks.warga.sumber}: {terpilih.modelLabel}
                </p>
              </section>

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

              <section className="bg-muted/30 rounded-xl border p-3">
                <p className="text-xs font-semibold">{teks.warga.arti}</p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  {teks.warga.artiTeks}
                </p>
              </section>

              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="size-4" aria-hidden="true" />
                {teks.warga.statusResmi}
              </div>

              <p className="text-muted-foreground pb-1 text-center text-[10px]">
                {teks.warga.catatanMock}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
