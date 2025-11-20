import { App, getLinkpath } from "obsidian";
import { of } from "true-myth/maybe";
import Result, { ok } from "true-myth/result";
import { fromMaybe, fromResult } from "true-myth/toolbelt";

import type { Card } from "../schema/card";
import { ImageLink, URLPath } from "../schema/image-link";

function resolveInternalImageLink(
  link: string,
  app: App,
): Result<string, string> {
  const linkPath = getLinkpath(link);

  const path = of(app.metadataCache.getFirstLinkpathDest(linkPath, ""))
    .map((file) => file.path)
    .map((path) => app.vault.adapter.getResourcePath(path));

  return fromMaybe(`Could not resolve image path \`${linkPath}\``, path);
}

function resolveRelativeURL(
  card: Pick<Card, "url">,
  value: URLPath,
): Result<string, string> {
  const url = new URL(value, card.url);

  return ok(url.toString());
}

/**
 * "Resolves" the various image representations into a renderable URL
 *
 * - Returns absolute external links unchanged
 * - Returns relative external links re-written to be relative to the URL host
 * - Returns internal image links to the usable Obsidian URL
 *
 * @param imageLink
 * @param card
 * @param app
 * @returns
 */
export function resolveImageLink(
  imageLink: ImageLink,
  card: Pick<Card, "url">,
  app: App,
): Result<string, string> {
  switch (imageLink.type) {
    case "absolute":
      return ok(imageLink.value);
    case "relative":
      return resolveRelativeURL(card, imageLink.value);
    case "internal":
      return resolveInternalImageLink(imageLink.value, app);
  }
}

type ImageProperties = Pick<Card, "image" | "favicon" | "url">;

export function resolveImageProperties(props: ImageProperties, app: App) {
  const { image, favicon } = props;

  return {
    image: of(image)
      .andThen((image) => fromResult(resolveImageLink(image, props, app)))
      .unwrapOr(undefined),
    favicon: of(favicon)
      .andThen((favicon) => fromResult(resolveImageLink(favicon, props, app)))
      .unwrapOr(undefined),
  };
}
