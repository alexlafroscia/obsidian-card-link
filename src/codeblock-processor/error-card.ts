import { MarkdownRenderChild } from "obsidian";

import Error from "../components/Error.svelte";
import { SvelteComponentChild } from "../svelte-component-child";

import type { RenderingContext } from ".";

export class ErrorCodeblockRenderer extends MarkdownRenderChild {
  constructor(messages: string[], context: RenderingContext) {
    super(context.containerEl);

    this.addChild(
      new SvelteComponentChild(Error, {
        target: context.containerEl,
        props: {
          messages,
        },
      }),
    );
  }
}
