import type { App } from "obsidian";
import Result, { ok } from "true-myth/result";

import type { ExternalLinkProps as FullExternalLinkProps } from "../components/link-card";
import { LinkEmbedContents } from "../schema/code-block-contents";

import { resolveImageProperties } from "./image-link";

type ExternalLinkProps = Omit<FullExternalLinkProps, "indent">;

export function resolveLinkCardProps(
  contents: LinkEmbedContents,
  app: App,
): Result<ExternalLinkProps, string> {
  return ok({
    ...contents,
    ...resolveImageProperties(contents, app),
  });
}
