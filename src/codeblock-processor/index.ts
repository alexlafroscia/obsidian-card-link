import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { of as maybeOf } from "true-myth/maybe";
import { ok, tryOr } from "true-myth/result";
import { fromResult as taskFromResult } from "true-myth/task";
import { fromMaybe, fromResult as maybeFromResult } from "true-myth/toolbelt";

import {
  type FileEmbedContents,
  parseCodeblockContents,
} from "../schema/code-block-contents";
import { fromCardStructure, getFailureResultMessages } from "../schema/card";
import type { CardStructure } from "../schema/card-structure";
import type { InternalLink } from "../schema/internal-link";

import {
  getFrontmatter,
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
    const cardView = await taskFromResult(
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

    return resolveFileReference(link, this.context.app)
      .andThen((file) =>
        fromMaybe(
          [`Frontmatter for "${link.value}" not loaded into cache`],
          getFrontmatter(file, this.context.app),
        ).map((frontmatter) => [file, frontmatter] as const),
      )
      .andThen(([file, frontmatter]) =>
        resolveFileCardProps(frontmatter, file, this.context.app),
      )
      .map((props) => {
        const codeblockRenderer = isSelfReference
          ? // A "self" reference should link to the URL; otherwise the file contains
            // a link to itself, which isn't that useful!
            new LinkCardCodeblockRenderer({ card: props }, this.context)
          : // Otherwise, render a link to the file; the URL can be opened or copied
            // from the buttons in the card if the user wants that instead
            new FileCardCodeblockRenderer({ card: props }, this.context);

        this.registerEvent(
          this.context.app.metadataCache.on(
            "changed",
            (file, _data, { frontmatter }) => {
              if (file.path === link.value) {
                const maybeUpdatedProps = maybeOf(frontmatter).andThen(
                  (frontmatter) =>
                    maybeFromResult(
                      resolveFileCardProps(frontmatter, file, this.context.app),
                    ),
                );

                if (maybeUpdatedProps.isJust) {
                  codeblockRenderer.setProps({ card: maybeUpdatedProps.value });
                }
              }
            },
          ),
        );

        return codeblockRenderer;
      });
  }

  private createInlineLinkCardRenderer(structure: CardStructure) {
    const card = fromCardStructure(structure);
    const linkCardProps = resolveComponentPropsFromCard(card, this.context.app);

    return new LinkCardCodeblockRenderer({ card: linkCardProps }, this.context);
  }

  private createErrorRenderer(messages: string[]) {
    return new ErrorCodeblockRenderer(messages, this.context);
  }
}
