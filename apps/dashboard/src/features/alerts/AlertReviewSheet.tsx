import { useEffect, useMemo, useState } from "react";
import { Loader2, Megaphone, RefreshCw, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { usePeringatanComposer } from "@/hooks/usePeringatanComposer";
import { usePeringatanPublik } from "@/hooks/usePeringatanPublik";
import { AKTOR_DEMO } from "@/lib/constants";
import { formatAngka, formatWaktuWib } from "@/lib/format";
import type { Catchment } from "@/schemas/catchment";
import type { HydroNetwork } from "@/schemas/hydro";
import type { Peringatan } from "@/schemas/peringatan";
import { buildKandidatPeringatan } from "@/services/alertService";
import { siarkanPeringatan, tarikPeringatan, tolakPeringatan } from "@/services/publicationService";
import type { SimulationResult } from "@/services/simulationService";
import { useOperatorStore } from "@/store/operatorStore";
import { bahasaAktif, teks } from "@/i18n/teks";

type AlertReviewSheetProps = {
  hasil: SimulationResult | undefined;
  network: HydroNetwork;
  catchments: Catchment[];
};

function waktuAtauStrip(nilai: string | null | undefined): string {
  return nilai ? formatWaktuWib(new Date(nilai)) : "—";
}

export function AlertReviewSheet({ hasil, network, catchments }: AlertReviewSheetProps) {
  const [terbuka, setTerbuka] = useState(false);
  const [dipilih, setDipilih] = useState<string | null>(null);
  const [teksSunting, setTeksSunting] = useState<Record<string, string>>({});
  const [pesan, setPesan] = useState<string | null>(null);
  const catatAudit = useOperatorStore((state) => state.catatAudit);
  const { indeks, aktif } = usePeringatanPublik();
  const { status: statusNarasi, compose } = usePeringatanComposer();

  const kandidat = useMemo(
    () =>
      hasil ? buildKandidatPeringatan(hasil, network, catchments, { bahasa: bahasaAktif }) : [],
    [hasil, network, catchments],
  );

  const statusById = useMemo(
    () => new Map(indeks.peringatan.map((item) => [item.id, item.status])),
    [indeks],
  );

  const terpilih = kandidat.find((item) => item.id === dipilih) ?? kandidat[0];
  const narasi = terpilih ? statusNarasi[terpilih.id]?.hasil : undefined;
  const memuatNarasi = terpilih ? (statusNarasi[terpilih.id]?.memuat ?? false) : false;
  const teksDasar = terpilih ? (narasi?.teks ?? terpilih.teksFinal) : "";
  const nilaiTeks = terpilih ? (teksSunting[terpilih.id] ?? teksDasar) : "";
  const status = terpilih ? statusById.get(terpilih.id) : undefined;
  const sudahDisiarkan = status === "disiarkan";
  const sudahDitolak = status === "ditolak";
  const bisaSiarkan =
    Boolean(terpilih) && nilaiTeks.trim().length > 0 && !sudahDisiarkan && !memuatNarasi;
  const bisaTolak = Boolean(terpilih) && !sudahDisiarkan && !sudahDitolak;

  useEffect(() => {
    if (!terbuka || !terpilih) return;
    if (statusNarasi[terpilih.id]?.hasil || statusNarasi[terpilih.id]?.memuat) return;
    void compose(terpilih);
  }, [terbuka, terpilih, statusNarasi, compose]);

  const peringatanSiapSiaran = (): Peringatan | null => {
    if (!terpilih) return null;
    const teksAwal = narasi?.teks ?? terpilih.teksAwal;
    return {
      ...terpilih,
      teksAwal,
      teksFinal: nilaiTeks.trim() || teksAwal,
      sumberNarasi: narasi?.sumber ?? terpilih.sumberNarasi,
      modelLabel: narasi?.modelLabel ?? terpilih.modelLabel,
      narasiDibuatPada: narasi?.dibuatPada ?? null,
      alasanFallback: narasi?.alasanFallback ?? null,
    };
  };

  const siarkan = () => {
    const siap = peringatanSiapSiaran();
    if (!siap) return;

    const waktu = new Date();
    const disunting = siap.teksFinal !== siap.teksAwal;

    if (disunting) {
      catatAudit(
        {
          jenis: "peringatan_disunting",
          referensiId: siap.id,
          aktor: AKTOR_DEMO,
          ringkasan: `${siap.wilayahNama}: teks peringatan disunting`,
        },
        waktu,
      );
    }

    const hasilSiaran = siarkanPeringatan(
      {
        ...siap,
        disuntingPada: disunting ? waktu.toISOString() : siap.disuntingPada,
      },
      { sekarang: waktu, oleh: AKTOR_DEMO },
    );

    for (const lama of hasilSiaran.digantikan) {
      catatAudit(
        {
          jenis: "peringatan_kedaluwarsa",
          referensiId: lama.id,
          aktor: AKTOR_DEMO,
          ringkasan: `${lama.wilayahNama}: digantikan siaran baru`,
        },
        waktu,
      );
    }

    catatAudit(
      {
        jenis: "peringatan_disiarkan",
        referensiId: siap.id,
        aktor: AKTOR_DEMO,
        ringkasan: `${siap.wilayahNama} · ${teks.level[siap.level]} · ${siap.sumberNarasi}`,
      },
      waktu,
    );

    setPesan(teks.peringatan.tersiar);
  };

  const tolak = () => {
    const siap = peringatanSiapSiaran();
    if (!siap) return;

    const waktu = new Date();
    tolakPeringatan(siap, { sekarang: waktu, oleh: AKTOR_DEMO });
    catatAudit(
      {
        jenis: "peringatan_ditolak",
        referensiId: siap.id,
        aktor: AKTOR_DEMO,
        ringkasan: `${siap.wilayahNama} · ${teks.level[siap.level]} · ${siap.sumberNarasi}`,
      },
      waktu,
    );
    setPesan(teks.peringatan.ditolak);
  };

  const generateUlang = async () => {
    if (!terpilih) return;
    setTeksSunting((sebelum) => {
      const berikut = { ...sebelum };
      delete berikut[terpilih.id];
      return berikut;
    });
    await compose(terpilih);
  };

  const tarik = (peringatan: Peringatan) => {
    const waktu = new Date();
    const hasilTarik = tarikPeringatan(peringatan.id, {
      sekarang: waktu,
      oleh: AKTOR_DEMO,
    });
    if (!hasilTarik) return;

    catatAudit(
      {
        jenis: "peringatan_ditarik",
        referensiId: peringatan.id,
        aktor: AKTOR_DEMO,
        ringkasan: `${peringatan.wilayahNama}: peringatan ditarik`,
      },
      waktu,
    );
    setPesan(teks.peringatan.ditarik);
  };

  return (
    <Sheet open={terbuka} onOpenChange={setTerbuka}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <Megaphone className="size-4 text-amber-500" aria-hidden="true" />
          {teks.peringatan.tombol}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Megaphone className="size-4 text-amber-500" aria-hidden="true" />
            {teks.peringatan.judul}
          </div>
          <SheetTitle>{teks.peringatan.subjudul}</SheetTitle>
          <SheetDescription className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
            {teks.peringatan.catatan}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          {kandidat.length === 0 || !terpilih ? (
            <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
              {teks.peringatan.kosong}
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="pilih-wilayah-peringatan">{teks.peringatan.pilihWilayah}</Label>
                <Select value={terpilih.id} onValueChange={setDipilih}>
                  <SelectTrigger id="pilih-wilayah-peringatan" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kandidat.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.wilayahNama} · {teks.level[item.level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={terpilih.level} />
                <ConfidenceBadge value={terpilih.keyakinan} />
                {memuatNarasi ? (
                  <Badge variant="secondary" className="gap-1.5">
                    <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                    {teks.peringatan.menyusun}
                  </Badge>
                ) : narasi?.sumber === "llm" ? (
                  <Badge variant="outline" className="gap-1.5">
                    <Sparkles className="size-3" aria-hidden="true" />
                    {teks.peringatan.sumberAi} · {narasi.modelLabel}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5">
                    <Wrench className="size-3" aria-hidden="true" />
                    {teks.peringatan.sumberTemplate}
                  </Badge>
                )}
                {sudahDisiarkan ? (
                  <Badge variant="default">{teks.peringatan.sudahDisiarkan}</Badge>
                ) : sudahDitolak ? (
                  <Badge variant="destructive">{teks.peringatan.sudahDitolak}</Badge>
                ) : null}
              </div>

              {narasi?.alasanFallback ? (
                <p className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
                  {teks.peringatan.alasan[narasi.alasanFallback]}
                </p>
              ) : null}

              <div className="text-muted-foreground grid gap-1 text-xs">
                <div className="flex justify-between gap-2">
                  <span>{teks.peringatan.estimasi}</span>
                  <span className="tabular-nums">
                    ± {terpilih.estimasiTibaMenit} {teks.satuan.menit}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>{teks.peringatan.puncak}</span>
                  <span className="tabular-nums">
                    {formatAngka(terpilih.puncakJam, 1)} {teks.satuan.jam}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>{teks.peringatan.sumber}</span>
                  <span>{narasi?.modelLabel ?? terpilih.modelLabel}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>{teks.peringatan.dibuat}</span>
                  <span className="tabular-nums">
                    {narasi ? formatWaktuWib(new Date(narasi.dibuatPada)) : "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="teks-peringatan">{teks.peringatan.teks}</Label>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={generateUlang}
                    disabled={memuatNarasi || sudahDisiarkan}
                    className="gap-1.5"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    {teks.peringatan.generateUlang}
                  </Button>
                </div>
                <Textarea
                  id="teks-peringatan"
                  value={nilaiTeks}
                  onChange={(event) =>
                    setTeksSunting((sebelum) => ({
                      ...sebelum,
                      [terpilih.id]: event.target.value,
                    }))
                  }
                  rows={6}
                  aria-describedby="catatan-peringatan"
                />
                <p id="catatan-peringatan" className="text-muted-foreground text-xs">
                  {teks.peringatan.tidakAdaPengiriman}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={siarkan} disabled={!bisaSiarkan} className="gap-2">
                  <Megaphone className="size-4" aria-hidden="true" />
                  {sudahDisiarkan ? teks.peringatan.sudahDisiarkan : teks.peringatan.siarkan}
                </Button>
                <Button variant="outline" onClick={tolak} disabled={!bisaTolak}>
                  {teks.peringatan.tolak}
                </Button>
              </div>

              {pesan ? (
                <p role="status" className="text-muted-foreground text-xs">
                  {pesan}
                </p>
              ) : null}
            </>
          )}

          <section className="space-y-2 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{teks.peringatan.aktif}</p>
              <span className="text-muted-foreground text-xs tabular-nums">{aktif.length}</span>
            </div>

            {aktif.length === 0 ? (
              <p className="text-muted-foreground text-xs">{teks.peringatan.aktifKosong}</p>
            ) : (
              <ul className="space-y-2">
                {aktif.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg border p-2"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <RiskBadge level={item.level} />
                        <span className="text-sm font-medium">{item.wilayahNama}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        {teks.peringatan.disiarkanPada} {waktuAtauStrip(item.disiarkanPada)}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {teks.peringatan.berlakuHingga} {waktuAtauStrip(item.berlakuHingga)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => tarik(item)}
                      className="shrink-0"
                    >
                      {teks.peringatan.tarik}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-muted-foreground text-xs">{teks.peringatan.catatanMock}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
