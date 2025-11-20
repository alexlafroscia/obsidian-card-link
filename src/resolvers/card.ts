import type { Card } from "../schema/card";

function ensureHostIsDefined({
  host,
  url,
}: Card): Pick<Card, "host"> | undefined {
  if (host) {
    return undefined;
  }

  const parsedUrl = new URL(url);

  return {
    host: parsedUrl.hostname,
  };
}

/**
 * Resolve some {@linkcode card} properties to make them better-suited for rendering
 *
 * - Define a `host` from the `url` if it's not provided
 */
export function enhanceCard(card: Card): Card {
  return {
    ...card,
    ...ensureHostIsDefined(card),
  };
}
