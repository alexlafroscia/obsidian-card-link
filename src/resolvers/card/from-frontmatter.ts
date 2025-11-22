import { App, Keymap, TFile, type FrontMatterCache } from "obsidian";
import Maybe, { just, of as maybeOf } from "true-myth/maybe";
import Result from "true-myth/result";
import { fromMaybe } from "true-myth/toolbelt";

import type { FileCard } from "../../components/common";
import type { InternalLink } from "../../schema/internal-link";

import { parseCardStructure } from "../../schema/card-structure";
import { fromCardStructure, getFailureResultMessages } from "../../schema/card";

import { resolveComponentPropsFromCard } from "../card-to-component-props";

export function resolveFileReference(
  link: InternalLink,
  app: App,
): Result<TFile, string> {
  const { value: linkPath } = link;

  const sourceFile = maybeOf(app.workspace.getActiveFile());
  const file = sourceFile.andThen(({ path }) =>
    maybeOf(app.metadataCache.getFirstLinkpathDest(linkPath, path)),
  );

  return fromMaybe(`Could not resolve file \`${file}\``, file);
}

export function makeOnClickHandler(file: TFile, app: App) {
  return function (event: MouseEvent) {
    app.workspace.getLeaf(Keymap.isModEvent(event)).openFile(file);
  };
}

export function getFrontmatter(file: TFile, app: App): Maybe<FrontMatterCache> {
  return maybeOf(app.metadataCache.getFileCache(file)).andThen((cache) =>
    maybeOf(cache.frontmatter),
  );
}

export function resolveFileCardProps(
  frontmatter: FrontMatterCache,
  file: TFile,
  app: App,
): Result<FileCard, string[]> {
  return parseCardStructure(frontmatter)
    .mapErr(getFailureResultMessages)
    .map((cardStructure) => fromCardStructure(cardStructure))
    .map((card) => ({
      ...resolveComponentPropsFromCard(card, app),
      title: card.title.map((maybeTitle) => maybeTitle.or(just(file.basename))),
      onClick: makeOnClickHandler(file, app),
    }));
}
