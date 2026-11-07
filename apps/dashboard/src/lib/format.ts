const angkaFormatter = (fractionDigits: number) =>
  new Intl.NumberFormat("id-ID", {
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
