import { MarkdownRenderChild } from "obsidian";
import { type MountOptions, type Component, mount, unmount } from "svelte";

export class SvelteComponentChild<
  Props extends Record<string, any>,
> extends MarkdownRenderChild {
  private component: Component<Props>;
  private options: MountOptions<Props>;

  private renderedComponent: {} | undefined;

  constructor(component: Component<Props>, options: MountOptions<Props>) {
    super(options.target as HTMLElement);

    this.component = component;
    this.options = {
      ...options,
    };
  }

  onload(): void {
    this.renderedComponent = mount(this.component, {
      ...this.options,
    });
  }

  onunload(): void {
    if (this.renderedComponent) {
      unmount(this.renderedComponent);
    }
  }
}
