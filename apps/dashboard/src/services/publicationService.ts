import {
  indeksPeringatanSchema,
  type IndeksPeringatan,
  type Peringatan,
} from "@/schemas/peringatan";
import { AKTOR_DEMO } from "@/lib/constants";

export const KUNCI_PUBLIKASI = "hydrotwin-peringatan-publik-v1";
export const NAMA_CHANNEL_PUBLIKASI = "hydrotwin-publik";
export const TTL_PERINGATAN_MS = 6 * 60 * 60 * 1000;

export type PenyimpananPublikasi = {
  getItem: (kunci: string) => string | null;
  setItem: (kunci: string, nilai: string) => void;
  removeItem: (kunci: string) => void;
};

export type OpsiPublicationService = {
  penyimpanan?: PenyimpananPublikasi | null;
  sekarang?: () => Date;
  siarkanChannel?: boolean;
};

type OpsiAksi = {
  sekarang?: Date;
  oleh?: string;
};

function indeksKosong(): IndeksPeringatan {
  return { diperbaruiPada: new Date(0).toISOString(), peringatan: [] };
}

function penyimpananBrowser(): PenyimpananPublikasi | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Store publikasi per wilayah. Satu wilayah hanya memiliki satu peringatan
 * berstatus disiarkan. Prototipe memakai localStorage + BroadcastChannel;
 * produksi memakai backend (lihat docs/plan/ews-simulator.md).
 */
export function buatPublicationService(opsi: OpsiPublicationService = {}) {
  let penyimpananAktif = opsi.penyimpanan === undefined ? penyimpananBrowser() : opsi.penyimpanan;
  const sekarang = opsi.sekarang ?? (() => new Date());
  const channelAktif = opsi.siarkanChannel ?? true;
  let memori: IndeksPeringatan = indeksKosong();
  const pendengar = new Set<() => void>();

  function emit() {
    for (const dengar of pendengar) dengar();
  }

  function broadcast() {
    if (!channelAktif || typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }
    try {
      const channel = new BroadcastChannel(NAMA_CHANNEL_PUBLIKASI);
      channel.postMessage({ jenis: "peringatan-berubah" });
      channel.close();
    } catch {
      // BroadcastChannel tidak wajib untuk prototipe.
    }
  }

  function baca(): IndeksPeringatan {
    if (!penyimpananAktif) return memori;

    let mentah: string | null;
    try {
      mentah = penyimpananAktif.getItem(KUNCI_PUBLIKASI);
    } catch {
      penyimpananAktif = null;
      return memori;
    }

    if (!mentah) return indeksKosong();

    try {
      return indeksPeringatanSchema.parse(JSON.parse(mentah));
    } catch {
      return indeksKosong();
    }
  }

  function simpan(indeks: IndeksPeringatan): IndeksPeringatan {
    const baru: IndeksPeringatan = {
      ...indeks,
      diperbaruiPada: sekarang().toISOString(),
    };

    if (penyimpananAktif) {
      try {
        penyimpananAktif.setItem(KUNCI_PUBLIKASI, JSON.stringify(baru));
      } catch {
        // Kuota penuh atau storage diblokir: tetap simpan di memori.
        penyimpananAktif = null;
        memori = baru;
      }
    } else {
      memori = baru;
    }

    emit();
    broadcast();
    return baru;
  }

  function siarkan(
    peringatan: Peringatan,
    aksi: OpsiAksi = {},
  ): { indeks: IndeksPeringatan; peringatan: Peringatan; digantikan: Peringatan[] } {
    const waktu = aksi.sekarang ?? sekarang();
    const oleh = aksi.oleh ?? AKTOR_DEMO;
    const indeks = baca();
    const lain = indeks.peringatan.filter((item) => item.id !== peringatan.id);
    const digantikan = lain.filter(
      (item) => item.status === "disiarkan" && item.wilayahKode === peringatan.wilayahKode,
    );
    const sisa = lain.map((item) =>
      digantikan.some((lama) => lama.id === item.id)
        ? { ...item, status: "kedaluwarsa" as const, kedaluwarsaPada: waktu.toISOString() }
        : item,
    );

    const final: Peringatan = {
      ...peringatan,
      teksFinal: peringatan.teksFinal.trim() || peringatan.teksAwal,
      status: "disiarkan",
      disiarkanPada: waktu.toISOString(),
      disiarkanOleh: oleh,
      berlakuHingga: new Date(waktu.getTime() + TTL_PERINGATAN_MS).toISOString(),
    };

    const indeksBaru = simpan({ ...indeks, peringatan: [final, ...sisa] });
    return { indeks: indeksBaru, peringatan: final, digantikan };
  }

  function tolak(peringatan: Peringatan, aksi: OpsiAksi = {}): Peringatan {
    const waktu = aksi.sekarang ?? sekarang();
    const indeks = baca();
    const final: Peringatan = {
      ...peringatan,
      teksFinal: peringatan.teksFinal.trim() || peringatan.teksAwal,
      status: "ditolak",
      ditolakPada: waktu.toISOString(),
      disiarkanPada: null,
      disiarkanOleh: null,
      berlakuHingga: null,
    };

    simpan({
      ...indeks,
      peringatan: [final, ...indeks.peringatan.filter((item) => item.id !== peringatan.id)],
    });
    return final;
  }

  function tarik(id: string, aksi: OpsiAksi = {}): Peringatan | null {
    const waktu = aksi.sekarang ?? sekarang();
    const indeks = baca();
    const target = indeks.peringatan.find((item) => item.id === id);
    if (!target || target.status !== "disiarkan") return null;

    const final: Peringatan = {
      ...target,
      status: "ditarik",
      ditarikPada: waktu.toISOString(),
    };

    simpan({
      ...indeks,
      peringatan: indeks.peringatan.map((item) => (item.id === id ? final : item)),
    });
    return final;
  }

  function kedaluwarsakan(waktu: Date = sekarang()): Peringatan[] {
    const indeks = baca();
    const kedaluwarsa: Peringatan[] = [];

    const peringatan = indeks.peringatan.map((item) => {
      if (item.status !== "disiarkan" || !item.berlakuHingga) return item;
      if (new Date(item.berlakuHingga).getTime() > waktu.getTime()) return item;

      const final: Peringatan = {
        ...item,
        status: "kedaluwarsa",
        kedaluwarsaPada: waktu.toISOString(),
      };
      kedaluwarsa.push(final);
      return final;
    });

    if (kedaluwarsa.length > 0) simpan({ ...indeks, peringatan });
    return kedaluwarsa;
  }

  function daftarAktif(indeks: IndeksPeringatan = baca(), waktu: Date = sekarang()): Peringatan[] {
    const prioritas = { siaga: 2, waspada: 1 } as const;

    return indeks.peringatan
      .filter(
        (item) =>
          item.status === "disiarkan" &&
          item.berlakuHingga !== null &&
          item.berlakuHingga !== undefined &&
          new Date(item.berlakuHingga).getTime() > waktu.getTime(),
      )
      .sort(
        (a, b) =>
          prioritas[b.level] - prioritas[a.level] ||
          (b.disiarkanPada ?? "").localeCompare(a.disiarkanPada ?? ""),
      );
  }

  function langganan(dengar: () => void): () => void {
    pendengar.add(dengar);

    let channel: BroadcastChannel | null = null;
    if (channelAktif && typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel(NAMA_CHANNEL_PUBLIKASI);
        channel.onmessage = () => dengar();
      } catch {
        channel = null;
      }
    }

    const padaStorage = (event: StorageEvent) => {
      if (event.key === KUNCI_PUBLIKASI) dengar();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", padaStorage);
    }

    return () => {
      pendengar.delete(dengar);
      channel?.close();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", padaStorage);
      }
    };
  }

  function reset(): void {
    if (penyimpananAktif) {
      try {
        penyimpananAktif.removeItem(KUNCI_PUBLIKASI);
      } catch {
        // abaikan
      }
    }
    memori = indeksKosong();
    emit();
    broadcast();
  }

  return { baca, siarkan, tolak, tarik, kedaluwarsakan, daftarAktif, langganan, reset };
}

export type PublicationService = ReturnType<typeof buatPublicationService>;

export const publicationService = buatPublicationService();

export const bacaIndeks = publicationService.baca;
export const siarkanPeringatan = publicationService.siarkan;
export const tolakPeringatan = publicationService.tolak;
export const tarikPeringatan = publicationService.tarik;
export const kedaluwarsakanPeringatan = publicationService.kedaluwarsakan;
export const daftarPeringatanAktif = publicationService.daftarAktif;
export const langgananPublikasi = publicationService.langganan;
export const resetPublikasi = publicationService.reset;
