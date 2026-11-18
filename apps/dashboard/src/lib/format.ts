import { bahasaAktif } from "@/i18n/teks";

const locale = bahasaAktif === "id" ? "id-ID" : "en-US";

const angkaFormatter = (fractionDigits: number) =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

const waktuFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatAngka(value: number, fractionDigits = 2): string {
  return angkaFormatter(fractionDigits).format(value);
}

export function formatWaktuWib(date: Date): string {
  return `${waktuFormatter.format(date)} WIB`;
}
