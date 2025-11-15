import { App, parseYaml } from "obsidian";
import { fromResult } from "true-myth/task";

import { parseCodeblockContents } from "./schema/code-block-contents";

import { createLinkCard } from "./components/link-card";
import { createErrorCard } from "./components/error-card";

import {
  resolveFileCardProps,
  resolveFileReference,
} from "./resolvers/file-card";
import { resolveLinkCardProps } from "./resolvers/link-card";

function measureIndent(source: string): number {
  let indent = -1;
  source = source
    .split(/\r?\n|\r|\n/g)
    .map((line) =>
      line.replace(/^\t+/g, (tabs) => {
        const n = tabs.length;
        if (indent < 0) {
          indent = n;
        }
        return " ".repeat(n);
      }),
    )
    .join("\n");

  return indent;
}

export class CodeBlockProcessor {
  app: App;

  constructor(app: App) {
    this.app = app;
  }

  async run(source: string, el: HTMLElement) {
    const cardElement = await fromResult(this.parseCodeBlock(source))
      .andThen((contents) => {
        if ("file" in contents) {
          const resolvedFile = fromResult(
            resolveFileReference(contents, this.app),
          );

          return resolvedFile.andThen((file) =>
            resolveFileCardProps(file, this.app),
          );
        } else {
          return resolveLinkCardProps(contents, this.app);
        }
      })
      .match({
        Rejected: (error) => createErrorCard(error),
        Resolved: (value) =>
          createLinkCard({
            ...value,
            indent: measureIndent(source),
          }),
      });

    el.appendChild(cardElement);
  }

  private parseCodeBlock(source: string) {
    const json = parseYaml(source);

    return parseCodeblockContents(json);
  }
}
