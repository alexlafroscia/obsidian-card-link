import { App, Keymap, TFile } from "obsidian";
import { of as maybeOf } from "true-myth/maybe";
import Result, { ok } from "true-myth/result";
import Task, { fromPromise } from "true-myth/task";
import { fromMaybe } from "true-myth/toolbelt";

import {
  type FileEmbedContents,
  parseLinkEmbedContents,
} from "../schema/code-block-contents";
import type { InternalLinkProps as FullInternalLinkProps } from "../components/link-card";
import { resolveImageLink } from "./image-link";

type InternalLinkProps = Omit<FullInternalLinkProps, "indent">;

export function resolveFileReference(
  value: FileEmbedContents,
  app: App,
): Result<TFile, string> {
  const { file: identifier } = value;

  const sourceFile = maybeOf(app.workspace.getActiveFile());
  const file =
    typeof identifier === "string"
      ? sourceFile
      : sourceFile.andThen(({ path }) =>
          maybeOf(
            app.metadataCache.getFirstLinkpathDest(identifier.value, path),
          ),
        );

  return fromMaybe(`Could not resolve file \`${file}\``, file);
}

export function makeOnClickHandler(file: TFile, app: App) {
  return function (event: MouseEvent) {
    app.workspace.getLeaf(Keymap.isModEvent(event)).openFile(file);
  };
}

export function resolveFileCardProps(
  file: TFile,
  app: App,
): Task<InternalLinkProps, string> {
  const resolveFrontmatter = new Promise<{ url: string }>((resolve) => {
    app.fileManager.processFrontMatter(file, (frontmatter) => {
      resolve(frontmatter);
    });
  });
  const resolveFrontmatterTask = fromPromise(resolveFrontmatter).mapRejected(
    () => `Frontmatter could not be resolved`,
  );

  return (
    resolveFrontmatterTask
      // Extract card props from file frontmatter
      .andThen((frontmatter) =>
        parseLinkEmbedContents({
          title: file.basename,
          ...frontmatter,
        }),
      )
      // Compute a `host` from the `url` if not explicitly provided
      .map((frontmatter) => ({
        ...frontmatter,

        host: maybeOf(frontmatter.host).unwrapOrElse(() => {
          const parsedUrl = new URL(frontmatter.url);

          return parsedUrl.hostname;
        }),
      }))
      // Resolve external image links to a renderable URL
      .map((frontmatter) => ({
        ...frontmatter,

        image: frontmatter.image
          ? resolveImageLink(frontmatter.image, app).unwrapOr(undefined)
          : undefined,
        favicon: frontmatter.favicon
          ? resolveImageLink(frontmatter.favicon, app).unwrapOr(undefined)
          : undefined,
      }))
      // Add click handler to open the file
      .map((cardProps) => ({
        ...cardProps,

        onClick: makeOnClickHandler(file, app),
      }))
  );
}
