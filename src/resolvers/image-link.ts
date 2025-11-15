import { App, getLinkpath } from "obsidian";
import Result, { ok, err } from "true-myth/result";

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
