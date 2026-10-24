export const copyFailed = '無法自動複製，請選取上方連結並手動複製。';

/** Copies a link shown in a field beside the button, then reports `copied`, or how to copy it by hand. */
export async function copyLink(link: string, copied: string, report: (message: string) => void) {
  try { await navigator.clipboard.writeText(link); report(copied); }
  catch { report(copyFailed); }
}
