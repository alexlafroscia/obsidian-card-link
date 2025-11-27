import { MarkdownRenderChild } from "obsidian";

import LinkCard, { type LinkCardProps } from "../components/LinkCard.svelte";
import { SvelteComponentChild } from "../svelte-component-child";

import type { RenderingContext } from ".";

export class LinkCardCodeblockRenderer extends MarkdownRenderChild {
  private svelteComponent: SvelteComponentChild<LinkCardProps>;

  constructor(props: LinkCardProps, context: RenderingContext) {
    super(context.containerEl);

    this.svelteComponent = this.addChild(
      new SvelteComponentChild(LinkCard, {
        target: context.containerEl,
        props,
      }),
    );
  }

  setProps(props: LinkCardProps) {
    this.svelteComponent.setProps(props);
  }
}
