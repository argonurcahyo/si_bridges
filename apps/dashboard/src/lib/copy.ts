/** Menyalin teks dengan fallback untuk konteks yang tidak mengizinkan Clipboard API. */
export async function salinTeks(teks: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(teks);
    return true;
  } catch {
    // lanjut ke fallback
  }

  try {
    const area = document.createElement("textarea");
    area.value = teks;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const berhasil = document.execCommand("copy");
    area.remove();
    return berhasil;
  } catch {
    return false;
  }
}
