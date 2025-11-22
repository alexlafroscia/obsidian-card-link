import { App, getLinkpath } from "obsidian";
import { of, just, nothing } from "true-myth/maybe";
import { ok } from "true-myth/result";

import type { Card } from "../schema/card";
import { ImageLink, URLPath } from "../schema/image-link";
import type { LinkCard, CardProp } from "src/components/common";

function resolveInternalImageLink(link: string, app: App): CardProp {
  const linkPath = getLinkpath(link);

  const path = of(app.metadataCache.getFirstLinkpathDest(linkPath, ""))
    .map((file) => file.path)
    .map((path) => app.vault.adapter.getResourcePath(path));

  return ok(path);
}

function resolveRelativeURL(card: Pick<Card, "url">, value: URLPath): CardProp {
  return card.url.map((maybeUrl) =>
    maybeUrl.map((url) => {
      return new URL(value, url).toString();
    }),
  );
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
): CardProp {
  switch (imageLink.type) {
    case "absolute":
      return ok(just(imageLink.value));
    case "relative":
      return resolveRelativeURL(card, imageLink.value);
    case "internal":
      return resolveInternalImageLink(imageLink.value, app);
  }
}

type RequiredCardImageProperties = Pick<Card, "image" | "favicon" | "url">;

export function extractImageProperties(
  props: RequiredCardImageProperties,
  app: App,
): Pick<LinkCard, "image" | "favicon"> {
  const { image, favicon } = props;

  return {
    image: image.andThen((maybeImage) =>
      maybeImage.match({
        Nothing: () => ok(nothing()),
        Just: (image) => resolveImageLink(image, props, app),
      }),
    ),
    favicon: favicon.andThen((maybeFavicon) =>
      maybeFavicon.match({
        Nothing: () => ok(nothing()),
        Just: (favicon) => resolveImageLink(favicon, props, app),
      }),
    ),
  };
}
