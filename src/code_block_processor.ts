import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { ok, tryOr } from "true-myth/result";
import { fromResult } from "true-myth/task";
import { mount, unmount } from "svelte";

import {
  type FileEmbedContents,
  parseCodeblockContents,
} from "./schema/code-block-contents";
import type { CardStructure } from "./schema/card-structure";
import {
  resolveFileCardProps,
  resolveFileReference,
} from "./resolvers/card/from-frontmatter";
import { resolveComponentPropsFromCard } from "./resolvers/card-to-component-props";
import { fromCardStructure, getFailureResultMessages } from "./schema/card";
import type { InternalLink } from "./schema/internal-link";

import FileCard from "./components/FileCard.svelte";
import LinkCard from "./components/LinkCard.svelte";
import Error from "./components/Error.svelte";

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

  private app: App;

  /**
   * The rendered Svelte component
   */
  private renderedComponent?: {};

  constructor(
    source: string,
    containerEl: HTMLElement,
    sourcePath: string,
    app: App,
  ) {
    super(containerEl);

    this.source = source;
    this.sourcePath = sourcePath;
    this.app = app;
  }

  async load() {
    this.renderedComponent = await fromResult(
      tryOr("Failed to parse YAML", () => parseYaml(this.source)),
    )
      .andThen((yaml) => parseCodeblockContents(yaml))
      .andThen((contents) => {
        if ("file" in contents) {
          return this.renderCardForFile(contents, this.containerEl);
        } else {
          return ok(this.renderCardForInlineLink(contents, this.containerEl));
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
        Rejected: (reason) => this.renderError(reason, this.containerEl),
      });
  }

  unload(): void {
    if (this.renderedComponent) {
      unmount(this.renderedComponent);
    }
  }

  /**
   * Renders and returns the Svelte component used to render a file
   */
  private renderCardForFile({ file }: FileEmbedContents, el: HTMLElement) {
    const isSelfReference = file === "self";
    const link: InternalLink = isSelfReference
      ? { type: "internal", value: this.sourcePath }
      : file;

    return fromResult(resolveFileReference(link, this.app))
      .andThen((file) => resolveFileCardProps(file, this.app))
      .map((props) => {
        return isSelfReference
          ? // A "self" reference should link to the URL; otherwise the file contains
            // a link to itself, which isn't that useful!
            mount(LinkCard, {
              target: el,
              props,
            })
          : // Otherwise, render a link to the file; the URL can be opened or copied
            // from the buttons in the card if the user wants that instead
            mount(FileCard, {
              target: el,
              props,
            });
      });
  }

  private renderCardForInlineLink(structure: CardStructure, el: HTMLElement) {
    const card = fromCardStructure(structure);
    const linkCardProps = resolveComponentPropsFromCard(card, this.app);

    return mount(LinkCard, {
      target: el,
      props: linkCardProps,
    });
  }

  private renderError(messages: string[], el: HTMLElement) {
    return mount(Error, {
      target: el,
      props: {
        messages,
      },
    });
  }
}
