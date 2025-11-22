import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { ok, tryOr } from "true-myth/result";
import { fromResult } from "true-myth/task";

import {
  type FileEmbedContents,
  parseCodeblockContents,
} from "../schema/code-block-contents";
import { fromCardStructure, getFailureResultMessages } from "../schema/card";
import type { CardStructure } from "../schema/card-structure";
import type { InternalLink } from "../schema/internal-link";

import {
  resolveFileCardProps,
  resolveFileReference,
} from "../resolvers/card/from-frontmatter";
import { resolveComponentPropsFromCard } from "../resolvers/card-to-component-props";

import { ErrorCodeblockRenderer } from "./error-card";
import { LinkCardCodeblockRenderer } from "./link-card";
import { FileCardCodeblockRenderer } from "./file-card";

/**
 * Common information that needs to be passed from the Plugin through
 * the rest of the rendering infrastructure
 */
export type RenderingContext = {
  app: App;
  containerEl: HTMLElement;
};

export class CodeBlockProcessor extends MarkdownRenderChild {
  /**
   * The raw contents of the codeblock being rendered
   */
  private source: string;

  /**
   * The path to the file rendering the codeblock
   *
   * This is necessary to resolve a "self"-referencing file card
   */
  private sourcePath: string;

  private context: RenderingContext;

  constructor(source: string, sourcePath: string, context: RenderingContext) {
    super(context.containerEl);

    this.source = source;
    this.sourcePath = sourcePath;
    this.context = context;
  }

  async onload() {
    const cardView = await fromResult(
      tryOr("Failed to parse YAML", () => parseYaml(this.source)),
    )
      .andThen((yaml) => parseCodeblockContents(yaml))
      .andThen((contents) => {
        if ("file" in contents) {
          return this.createFileCardRenderer(contents, this.containerEl);
        } else {
          return ok(this.createInlineLinkCardRenderer(contents));
        }
      })
      .mapRejected((error) =>
        Array.isArray(error)
          ? error
          : typeof error === "string"
            ? [error]
            : getFailureResultMessages(error),
      )
      .match({
        Resolved: (value) => value,
        Rejected: (reason) => {
          return this.createErrorRenderer(reason);
        },
      });

    this.addChild(cardView);
  }

  /**
   * Renders and returns the Svelte component used to render a file
   */
  private createFileCardRenderer({ file }: FileEmbedContents, el: HTMLElement) {
    const isSelfReference = file === "self";
    const link: InternalLink = isSelfReference
      ? { type: "internal", value: this.sourcePath }
      : file;

    return fromResult(resolveFileReference(link, this.context.app))
      .andThen((file) => resolveFileCardProps(file, this.context.app))
      .map((props) => {
        return isSelfReference
          ? // A "self" reference should link to the URL; otherwise the file contains
            // a link to itself, which isn't that useful!
            new LinkCardCodeblockRenderer(props, this.context)
          : // Otherwise, render a link to the file; the URL can be opened or copied
            // from the buttons in the card if the user wants that instead
            new FileCardCodeblockRenderer(props, this.context);
      });
  }

  private createInlineLinkCardRenderer(structure: CardStructure) {
    const card = fromCardStructure(structure);
    const linkCardProps = resolveComponentPropsFromCard(card, this.context.app);

    return new LinkCardCodeblockRenderer(linkCardProps, this.context);
  }

  private createErrorRenderer(messages: string[]) {
    return new ErrorCodeblockRenderer(messages, this.context);
  }
}
