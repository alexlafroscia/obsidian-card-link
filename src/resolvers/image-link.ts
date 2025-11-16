import { App, getLinkpath } from "obsidian";
import Result, { ok, err } from "true-myth/result";

import { LinkEmbedContents } from "../schema/code-block-contents";
import { ImageLink } from "../schema/image-link";

function resolveInternalImageLink(
  link: string,
  app: App,
): Result<string, string> {
  const linkPath = getLinkpath(link);
  const imageRelativePath = app.metadataCache.getFirstLinkpathDest(
    linkPath,
    "",
  )?.path;

  if (!imageRelativePath) {
    return err(`Could not resolve image path \`${linkPath}\``);
  }

  return ok(app.vault.adapter.getResourcePath(imageRelativePath));
}

export function resolveImageLink(
  imageLink: ImageLink,
  app: App,
): Result<string, string> {
  switch (imageLink.type) {
    case "external":
      return ok(imageLink.value);
    case "internal":
      return resolveInternalImageLink(imageLink.value, app);
  }
}

type ImageProperties = Pick<LinkEmbedContents, "image" | "favicon">;

export function resolveImageProperties(props: ImageProperties, app: App) {
  const { image, favicon } = props;

  return {
    image: image ? resolveImageLink(image, app).unwrapOr(undefined) : undefined,
    favicon: favicon
      ? resolveImageLink(favicon, app).unwrapOr(undefined)
      : undefined,
  };
}
