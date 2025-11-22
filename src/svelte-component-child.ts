import { MarkdownRenderChild } from "obsidian";
import { ImperativeComponent } from "svelte-imperative";
import type { Component } from "svelte";

interface Options<Props> {
  props: Props;
  target: HTMLElement;
}

export class SvelteComponentChild<
  Props extends Record<string, any>,
> extends MarkdownRenderChild {
  private component: Component<Props>;
  private options: Options<Props>;

  private renderedComponent: ImperativeComponent<Props> | undefined;

  constructor(component: Component<Props>, options: Options<Props>) {
    super(options.target);

    this.component = component;
    this.options = options;
  }

  onload(): void {
    this.renderedComponent = new ImperativeComponent(
      this.options.target,
      this.component,
      this.options.props,
    );
  }

  onunload(): void {
    this.renderedComponent?.destroy();
  }

  /**
   * Update the properties of the rendered component
   */
  setProps(props: Props) {
    this.renderedComponent?.setProps(props);
  }
}
