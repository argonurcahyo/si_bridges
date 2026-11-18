import { beforeEach, describe, expect, it } from "vitest";
import type { Peringatan } from "@/schemas/peringatan";
import { buildKandidatPeringatan } from "@/services/alertService";
import { loadCatchments } from "@/services/catchmentService";
import { loadNetwork } from "@/services/networkService";
import {
  buatPublicationService,
  TTL_PERINGATAN_MS,
  type PenyimpananPublikasi,
} from "@/services/publicationService";
import { runSimulation } from "@/services/simulationService";

const network = loadNetwork();
const catchments = loadCatchments(network);
const waktuSimulasi = new Date("2026-11-18T07:30:00.000Z");

function kandidat(): Peringatan[] {
  const hasil = runSimulation(
    { intensitasMmJam: 200, konversiLahanPersen: 30 },
    network,
    catchments,
    { sekarang: waktuSimulasi },
  );
  return buildKandidatPeringatan(hasil, network, catchments, { sekarang: waktuSimulasi });
}

function penyimpananUji(): PenyimpananPublikasi {
  const data = new Map<string, string>();
  return {
    getItem: (kunci) => data.get(kunci) ?? null,
    setItem: (kunci, nilai) => {
      data.set(kunci, nilai);
    },
    removeItem: (kunci) => {
      data.delete(kunci);
    },
  };
}

describe("publicationService", () => {
  let sekarang: Date;
  let penyimpanan: PenyimpananPublikasi;
  let service: ReturnType<typeof buatPublicationService>;

  beforeEach(() => {
    sekarang = new Date("2026-11-18T08:00:00.000Z");
    penyimpanan = penyimpananUji();
    service = buatPublicationService({
      penyimpanan,
      siarkanChannel: false,
      sekarang: () => sekarang,
    });
  });

  it("menyiarkan peringatan dan menampilkannya sebagai aktif", () => {
    const [item] = kandidat();
    const hasil = service.siarkan(item!, { oleh: "Operator uji" });

    expect(hasil.peringatan.status).toBe("disiarkan");
    expect(hasil.peringatan.disiarkanOleh).toBe("Operator uji");
    expect(hasil.peringatan.berlakuHingga).toBe(
      new Date(sekarang.getTime() + TTL_PERINGATAN_MS).toISOString(),
    );
    expect(service.daftarAktif()).toHaveLength(1);
  });

  it("hanya menampilkan peringatan yang disiarkan", () => {
    const [item] = kandidat();
    service.tolak(item!);

    expect(service.daftarAktif()).toHaveLength(0);
    expect(service.baca().peringatan[0]?.status).toBe("ditolak");
  });

  it("satu wilayah hanya memiliki satu peringatan aktif", () => {
    const [item] = kandidat();
    const baru = { ...item!, id: `${item!.id}-baru` };

    service.siarkan(item!);
    const hasil = service.siarkan(baru);

    expect(hasil.digantikan).toHaveLength(1);
    expect(hasil.digantikan[0]?.id).toBe(item!.id);

    const tersimpan = service.baca().peringatan;
    expect(tersimpan.find((p) => p.id === item!.id)?.status).toBe("kedaluwarsa");
    expect(service.daftarAktif()).toHaveLength(1);
    expect(service.daftarAktif()[0]?.wilayahKode).toBe(item!.wilayahKode);
  });

  it("siaran wilayah berbeda tidak saling menggantikan", () => {
    const [pertama, kedua] = kandidat();
    service.siarkan(pertama!);
    service.siarkan(kedua!);

    const aktif = service.daftarAktif();
    expect(aktif).toHaveLength(2);
    expect(new Set(aktif.map((item) => item.wilayahKode)).size).toBe(2);
  });

  it("menarik peringatan menghilangkannya dari daftar aktif", () => {
    const [item] = kandidat();
    service.siarkan(item!);

    const ditarik = service.tarik(item!.id);
    expect(ditarik?.status).toBe("ditarik");
    expect(service.daftarAktif()).toHaveLength(0);
  });

  it("menandai peringatan kedaluwarsa setelah TTL", () => {
    const [item] = kandidat();
    service.siarkan(item!);

    sekarang = new Date(sekarang.getTime() + TTL_PERINGATAN_MS + 1_000);
    const kedaluwarsa = service.kedaluwarsakan();

    expect(kedaluwarsa).toHaveLength(1);
    expect(kedaluwarsa[0]?.status).toBe("kedaluwarsa");
    expect(service.daftarAktif()).toHaveLength(0);
  });

  it("menyimpan peringatan ke storage yang sama", () => {
    const [item] = kandidat();
    service.siarkan(item!);

    const serviceLain = buatPublicationService({
      penyimpanan,
      siarkanChannel: false,
      sekarang: () => sekarang,
    });

    expect(serviceLain.baca().peringatan[0]?.id).toBe(item!.id);
    expect(serviceLain.daftarAktif()).toHaveLength(1);
  });

  it("memberi tahu pelanggan saat indeks berubah", () => {
    let panggilan = 0;
    const batal = service.langganan(() => {
      panggilan += 1;
    });

    const [item] = kandidat();
    service.siarkan(item!);
    expect(panggilan).toBeGreaterThan(0);

    batal();
    const sebelum = panggilan;
    service.tarik(item!.id);
    expect(panggilan).toBe(sebelum);
  });

  it("reset mengosongkan indeks", () => {
    const [item] = kandidat();
    service.siarkan(item!);
    service.reset();

    expect(service.baca().peringatan).toHaveLength(0);
    expect(service.daftarAktif()).toHaveLength(0);
  });
});
