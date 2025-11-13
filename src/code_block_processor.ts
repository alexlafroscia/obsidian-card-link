import { App, parseYaml, Notice, ButtonComponent, getLinkpath } from "obsidian";
import * as z from "zod/mini";
import type { ParseResult } from "true-myth/standard-schema";

import { CheckIf } from "./checkif";
import { parseLinkMetadataFromJSON } from "./code_block_parser";
import type { LinkMetadata, LinkMetadataWithIndent } from "./types";

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
    const data = this.resolveLinkMetadataFromYaml(source);

    if (data.isOk) {
      el.appendChild(
        this.genLinkEl({
          ...data.value,
          indent: measureIndent(source),
        }),
      );
    } else {
      el.appendChild(this.genErrorEl(z.prettifyError(data.error)));
    }
  }

  private resolveLinkMetadataFromYaml(
    source: string,
  ): ParseResult<LinkMetadata> {
    const json = parseYaml(source);

    return parseLinkMetadataFromJSON(json).map((value) => {
      return value;
    });
  }

  private genErrorEl(errorMsg: string): HTMLElement {
    const containerEl = document.createElement("div");
    containerEl.addClass("auto-card-link-error-container");

    containerEl.textContent = errorMsg;

    return containerEl;
  }

  private genLinkEl(data: LinkMetadataWithIndent): HTMLElement {
    const containerEl = document.createElement("div");
    containerEl.addClass("auto-card-link-container");
    containerEl.setAttr("data-auto-card-link-depth", data.indent);

    const cardEl = document.createElement("a");
    cardEl.addClass("auto-card-link-card");
    cardEl.setAttr("href", data.url);
    containerEl.appendChild(cardEl);

    const mainEl = document.createElement("div");
    mainEl.addClass("auto-card-link-main");
    cardEl.appendChild(mainEl);

    const titleEl = document.createElement("div");
    titleEl.addClass("auto-card-link-title");
    titleEl.textContent = data.title;
    mainEl.appendChild(titleEl);

    if (data.description) {
      const descriptionEl = document.createElement("div");
      descriptionEl.addClass("auto-card-link-description");
      descriptionEl.textContent = data.description;
      mainEl.appendChild(descriptionEl);
    }

    const hostEl = document.createElement("div");
    hostEl.addClass("auto-card-link-host");
    mainEl.appendChild(hostEl);

    if (data.favicon) {
      if (!CheckIf.isUrl(data.favicon))
        data.favicon = this.getLocalImagePath(data.favicon);

      const faviconEl = document.createElement("img");
      faviconEl.addClass("auto-card-link-favicon");
      faviconEl.setAttr("src", data.favicon);
      hostEl.appendChild(faviconEl);
    }

    if (data.host) {
      const hostNameEl = document.createElement("span");
      hostNameEl.textContent = data.host;
      hostEl.appendChild(hostNameEl);
    }

    if (data.image) {
      if (!CheckIf.isUrl(data.image))
        data.image = this.getLocalImagePath(data.image);

      const thumbnailEl = document.createElement("img");
      thumbnailEl.addClass("auto-card-link-thumbnail");
      thumbnailEl.setAttr("src", data.image);
      thumbnailEl.setAttr("draggable", "false");
      cardEl.appendChild(thumbnailEl);
    }

    new ButtonComponent(containerEl)
      .setClass("auto-card-link-copy-url")
      .setClass("clickable-icon")
      .setIcon("copy")
      .setTooltip(`Copy URL\n${data.url}`)
      .onClick(() => {
        navigator.clipboard.writeText(data.url);
        new Notice("URL copied to your clipboard");
      });

    return containerEl;
  }

  private getLocalImagePath(link: string): string {
    link = link.slice(2, -2); // remove [[]]
    const imageRelativePath = this.app.metadataCache.getFirstLinkpathDest(
      getLinkpath(link),
      "",
    )?.path;

    if (!imageRelativePath) return link;

    return this.app.vault.adapter.getResourcePath(imageRelativePath);
  }
}
