/**
 * Human-readable file name from an S3 key or full URL.
 * Upload keys follow `uploads/{timestamp}_{originalName}` (multer-s3 in this project).
 */
export function getAttachmentDisplayFileName(rawLink: string): string {
  if (!rawLink || typeof rawLink !== "string") return "";

  let decoded = rawLink.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // keep raw
  }

  let base = decoded;
  try {
    if (/^https?:\/\//i.test(decoded)) {
      const u = new URL(decoded);
      const seg = u.pathname.split("/").filter(Boolean).pop();
      if (seg) base = seg;
    } else {
      const seg = decoded.split("/").filter(Boolean).pop();
      if (seg) base = seg;
    }
  } catch {
    const parts = decoded.split("/");
    base = parts[parts.length - 1] || decoded;
  }

  const withoutUnderscoreTs = base.replace(/^\d{10,}_/, "");
  if (withoutUnderscoreTs !== base) return withoutUnderscoreTs;

  const withoutHyphenTs = base.replace(/^\d{10,}-/, "");
  if (withoutHyphenTs !== base) return withoutHyphenTs;

  const hyphenParts = base.split("-");
  if (hyphenParts.length > 1 && /^\d+$/.test(hyphenParts[0])) {
    return hyphenParts.slice(1).join("-");
  }

  return base;
}
