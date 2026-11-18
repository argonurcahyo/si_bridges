import type { AlasanFallback } from "./types";

export function denganTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
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

export function alasanKegagalan(galat: unknown): AlasanFallback {
  return galat instanceof Error && galat.message === "timeout" ? "timeout" : "error";
}
