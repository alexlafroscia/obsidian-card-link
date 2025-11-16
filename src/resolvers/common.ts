export function ensureFaviconHasHost(favicon: string, url: string): string {
  const faviconUrl = new URL(favicon, url);

  return faviconUrl.toString();
}
