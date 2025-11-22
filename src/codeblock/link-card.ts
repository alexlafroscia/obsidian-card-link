import { MarkdownRenderChild } from "obsidian";

import LinkCard, { type LinkCardProps } from "../components/LinkCard.svelte";
import { SvelteComponentChild } from "../svelte-component-child";

import type { RenderingContext } from "./processor";

export class LinkCardCodeblockRenderer extends MarkdownRenderChild {
  constructor(props: LinkCardProps, context: RenderingContext) {
    super(context.containerEl);

    this.addChild(
      new SvelteComponentChild(LinkCard, {
        target: context.containerEl,
        props,
      }),
    );
  }
}
