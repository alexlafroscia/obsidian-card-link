<script lang="ts" module>
  import type { Snippet } from "svelte";
  import { Notice } from "obsidian";
  import { fromResult } from "true-myth/toolbelt";

  import type { CardProp, LinkCard } from "./common";
  import Button from "./obsidian/Button.svelte";

  type CardPropValues = Record<keyof LinkCard, string | undefined>;

  function extractPropValue(prop: CardProp): string | undefined {
    return fromResult(prop).flatten().unwrapOr(undefined);
  }

  function extractPropValues(card: LinkCard): CardPropValues {
    return {
      title: extractPropValue(card.title),
      description: extractPropValue(card.description),
      favicon: extractPropValue(card.favicon),
      image: extractPropValue(card.image),
      url: extractPropValue(card.url),
    };
  }
</script>

<script lang="ts">
  interface Props {
    card: LinkCard;
    buttons?: Snippet<[CardPropValues]>;
  }

  let { buttons, card }: Props = $props();

  let propValues = $derived(extractPropValues(card));
  let { title, description, favicon, image, url } = $derived(propValues);

  let host = $derived(url ? new URL(url).hostname : undefined);
</script>

<div class="auto-card-link-main">
  {#if title}
    <div class="auto-card-link-title">
      {title}
    </div>
  {/if}

  {#if description}
    <div class="auto-card-link-description">
      {description}
    </div>
  {/if}

  <div class="auto-card-link-host">
    {#if favicon}
      <img class="auto-card-link-favicon" src={favicon} alt="Favicon" />
    {/if}

    <span>{host}</span>

    <div class="link-card-button-container">
      {@render buttons?.(propValues)}

      {#if url}
        <Button
          icon="copy"
          tooltip={`Copy URL\n${url}`}
          onClick={(event) => {
            // Stop the click event from triggering on the card itself
            event.preventDefault();
            event.stopPropagation();

            navigator.clipboard.writeText(url);
            new Notice("URL copied to your clipboard");
          }}
        />
      {/if}
    </div>
  </div>
</div>

{#if image}
  <img
    class="auto-card-link-thumbnail"
    src={image}
    alt="Thumbnail"
    draggable={false}
  />
{/if}

<style>
  .auto-card-link-host {
    flex-grow: 1;
    align-items: end;

    span {
      flex-grow: 1;
    }
  }

  .link-card-button-container {
    display: flex;
    opacity: 0;

    :global(.auto-card-link-card):hover & {
      opacity: 1;
    }

    :global(.clickable-icon) {
      --cursor: pointer;
    }
  }
</style>
