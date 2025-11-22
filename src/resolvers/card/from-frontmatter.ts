import { App, Keymap, TFile } from "obsidian";
import { of as maybeOf } from "true-myth/maybe";
import Result from "true-myth/result";
import Task, { fromPromise } from "true-myth/task";
import { fromMaybe } from "true-myth/toolbelt";

import type { FileCardProps } from "../../components/FileCard.svelte";
import type { FileEmbedContents } from "../../schema/code-block-contents";

import { parseCardStructure } from "../../schema/card-structure";
import { fromCardStructure, getFailureResultMessages } from "../../schema/card";

import { extractImageProperties } from "../image-link";

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
): Task<FileCardProps, string[]> {
  const resolveFrontmatter = new Promise((resolve) => {
    app.fileManager.processFrontMatter(file, (frontmatter) => {
      resolve(frontmatter);
    });
  });
  const resolveFrontmatterTask = fromPromise(resolveFrontmatter).mapRejected(
    () => [`Frontmatter could not be resolved`],
  );

  return resolveFrontmatterTask
    .andThen((frontmatter) =>
      parseCardStructure(frontmatter).mapErr(getFailureResultMessages),
    )
    .map((cardStructure) => fromCardStructure(cardStructure))
    .map((card) => ({
      ...card,
      ...extractImageProperties(card, app),
      onClick: makeOnClickHandler(file, app),
    }));
}
