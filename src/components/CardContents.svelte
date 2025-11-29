<script lang="ts" module>
  import { fromResult } from "true-myth/toolbelt";

  import type { CardProp, LinkCard } from "./common";

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
  }

  let { card }: Props = $props();

  let propValues = $derived(extractPropValues(card));
  let { title, description, favicon, image, url } = $derived(propValues);

  let host = $derived(url ? new URL(url).hostname : undefined);
</script>

<div class="link-card-contents">
  {#if image}
    <div class="link-card-thumbnail-container">
      <img
        class="link-card-thumbnail-background"
        src={image}
        alt="Thumbnail background blur"
        aria-hidden="true"
        draggable={false}
      />

      <img
        class="link-card-thumbnail"
        src={image}
        alt="Thumbnail"
        draggable={false}
      />
    </div>
  {/if}

  <div class="link-card-details">
    {#if title}
      <div class="link-card-title">
        {title}
      </div>
    {/if}

    {#if description}
      <div class="link-card-description">
        {description}
      </div>
    {/if}

    <div class="link-card-host">
      {#if favicon}
        <img src={favicon} alt="Favicon" />
      {/if}

      <span>{host}</span>
    </div>
  </div>
</div>

<style>
  .link-card-contents {
    display: flex;
    flex-direction: column;
    transition: 20ms ease-in 0s;
    color: var(--link-external-color);
    background: var(--background-primary-alt);
    border: solid var(--border-width) var(--divider-color);
    border-top-right-radius: var(--card-top-radius);
    border-top-left-radius: var(--card-top-radius);
    border-bottom-left-radius: var(--card-bottom-radius);
    border-bottom-right-radius: var(--card-bottom-radius);

    &:hover {
      background: var(--background-modifier-hover);
      border-color: var(--background-modifier-hover);
    }

    @container card-container (width > 500px) {
      flex-direction: row;
      height: 8em;
    }
  }

  .link-card-thumbnail-container {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    border-radius: var(--card-top-radius) var(--card-top-radius) 0 0 !important;
    aspect-ratio: 2 / 1;
    flex-shrink: 0;

    @container card-container (width > 500px) {
      border-radius: var(--card-top-radius) 0 0 var(--card-bottom-radius) !important;
    }
  }

  .link-card-thumbnail-background {
    border-radius: 0 !important;
    filter: blur(12px);
    position: absolute;
    height: 100%;
    width: 100%;
  }

  .link-card-thumbnail {
    border-radius: 0 !important;
    position: absolute;
    object-fit: contain;
    height: 100%;
  }

  .link-card-details {
    display: grid;
    grid-template-columns: 1fr var(--button-container-safe-width, auto);
    grid-template-rows: min-content auto max(
        min-content,
        var(--button-container-safe-height, auto)
      );
    grid-template-areas:
      "title title"
      "description description"
      "host .";
    gap: var(--size-2-2);
    padding: var(--size-2-3);
    flex-grow: 1;
  }

  .link-card-title {
    grid-area: title;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: var(--link-external-color-hover);
    }
  }

  .link-card-description {
    grid-area: description;
    color: var(--text-muted);
    font-size: var(--font-smallest);
    overflow: hidden;
  }

  .link-card-host {
    display: flex;
    align-items: end;
    flex-direction: row;
    font-size: var(--font-smallest);
    grid-area: host;

    &:hover {
      color: var(--link-external-color-hover);
    }

    /* Favicon */
    img {
      width: 16px !important;
      height: auto !important;
      margin: 0 0.5em 0 0 !important;
    }

    /* URL Host */
    span {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
