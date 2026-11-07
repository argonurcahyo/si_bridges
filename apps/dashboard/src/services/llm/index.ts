import { buatMockProvider, type MockLlmOptions } from "./mockProvider";
import { ruleBasedProvider } from "./ruleBasedProvider";
import { susunSaran } from "./saran";
import {
  idRekomendasi,
  ringkasanInput,
  type AlasanFallback,
  type NarrativeInput,
  type NarrativeProvider,
  type NarrativeResult,
} from "./types";
import { validateNarrative } from "./validateNarrative";

export const TIMEOUT_LLM_MS = 5000;

export type GenerateOptions = MockLlmOptions & {
  provider?: NarrativeProvider;
  sekarang?: Date;
  timeoutMs?: number;
};

function denganTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    promise.then(
      (nilai) => {
        clearTimeout(id);
        resolve(nilai);
      },
      (galat: unknown) => {
        clearTimeout(id);
        reject(galat);
      },
    );
  });
}

/**
 * Strategi narasi (ADR-004): coba LLM, validasi angka, lalu fallback rule-based.
 * Fungsi ini tidak pernah melempar error ke pemanggil; selalu mengembalikan narasi.
 */
export async function generateNarrative(
  input: NarrativeInput,
  opsi: GenerateOptions = {},
): Promise<NarrativeResult> {
  const { sekarang = new Date(), timeoutMs = TIMEOUT_LLM_MS, provider, ...mockOptions } = opsi;
  const llm = provider ?? buatMockProvider(mockOptions);

  const dasar = {
    id: idRekomendasi(input.hasil),
    confidence: input.hasil.keyakinan,
    dibuatPada: sekarang.toISOString(),
    ringkasanInput: ringkasanInput(input.hasil),
  };

  const fallback = async (alasan: AlasanFallback): Promise<NarrativeResult> => {
    const draft = await ruleBasedProvider.generate(input);
    return {
      ...dasar,
      teks: draft.teks,
      sumber: "rule_based",
      modelLabel: ruleBasedProvider.modelLabel,
      alasanFallback: alasan,
    };
  };

  try {
    const draft = await denganTimeout(llm.generate(input), timeoutMs);
    const menyimpang = validateNarrative(draft.teks, input.hasil, input.saran);

    if (menyimpang.length > 0) return await fallback("validasi");

    return {
      ...dasar,
      teks: draft.teks,
      sumber: "llm",
      modelLabel: llm.modelLabel,
    };
  } catch (galat) {
    const alasan: AlasanFallback =
      galat instanceof Error && galat.message === "timeout" ? "timeout" : "error";
    return fallback(alasan);
  }
}

export { susunSaran };
export type { NarrativeInput, NarrativeResult };
