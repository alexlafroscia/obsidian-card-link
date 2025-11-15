import { App, Keymap, TFile } from "obsidian";
import Result, { ok, err } from "true-myth/result";
import Task, { fromPromise, reject } from "true-myth/task";

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
  const sourceFile = app.workspace.getActiveFile();
  const file = app.metadataCache.getFirstLinkpathDest(
    value.file,
    sourceFile!.path,
  );

  if (!file) {
    return err(`Could not resolve file \`${file}\``);
  }

  return ok(file);
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

  return resolveFrontmatterTask
    .andThen((frontmatter) =>
      parseLinkEmbedContents({
        title: file.basename,
        ...frontmatter,
      }),
    )
    .andThen((contents) => {
      return ok({
        ...contents,

        image: contents.image
          ? resolveImageLink(contents.image, app).unwrapOr(undefined)
          : undefined,
        favicon: contents.favicon
          ? resolveImageLink(contents.favicon, app).unwrapOr(undefined)
          : undefined,
      });
    })
    .map((linkProps) => ({
      ...linkProps,

      onClick: makeOnClickHandler(file, app),
    }));
}
