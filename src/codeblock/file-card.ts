import { MarkdownRenderChild } from "obsidian";

import FileCard, {
  type Props as FileCardProps,
} from "../components/FileCard.svelte";
import { SvelteComponentChild } from "../svelte-component-child";

import type { RenderingContext } from "./processor";

export class FileCardCodeblockRenderer extends MarkdownRenderChild {
  constructor(props: FileCardProps, context: RenderingContext) {
    super(context.containerEl);

    this.addChild(
      new SvelteComponentChild(FileCard, {
        target: context.containerEl,
        props,
      }),
    );
  }
}
