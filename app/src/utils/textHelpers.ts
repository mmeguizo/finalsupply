export const escapeHtml = (str: string) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const nl2br = (s: string) =>
  escapeHtml(s).replace(/\r\n|\r|\n/g, "<br/>");

