<script lang="ts">
  import type { Snippet } from "svelte";
  import { slide } from "svelte/transition";

  import type { LinkCard } from "./common";

  import Button from "./obsidian/Button.svelte";
  import CardErrors from "./CardErrors.svelte";

  interface Props {
    card: LinkCard;
    contents: Snippet;
    buttons?: Snippet;
  }

  let { buttons, card, contents }: Props = $props();

  let hasErrors = $derived(
    Object.values(card).some((propValue) => propValue.isErr)
  );
  let showErrors = $state(false);
</script>

<div class="link-card-container">
  <div class="link-card-contents-wrapper">
    {@render contents()}

    <div class="link-card-button-container">
      {#if hasErrors}
        <Button
          --icon-color="var(--text-error)"
          icon="triangle-alert"
          tooltip="Show Errors"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            showErrors = !showErrors;
          }}
        />
      {/if}

      {@render buttons?.()}
    </div>
  </div>

  {#if showErrors}
    <div transition:slide>
      <CardErrors {card} />
    </div>
  {/if}
</div>

<style>
  .link-card-container {
    container: card-container / inline-size;
    overflow: hidden;
    user-select: none;
  }

  .link-card-contents-wrapper {
    --button-container-safe-width: calc(
      3 * (2 * var(--size-2-3) + var(--icon-size))
    );
    --button-container-safe-height: calc(
      1 * (2 * var(--size-2-2) + var(--icon-size))
    );

    /* Allows button container positioning */
    position: relative;
  }

  .link-card-button-container {
    display: flex;

    /* Position buttons over the bottom-right corner of the card */
    position: absolute;
    inset-block-end: var(--size-2-2);
    inset-inline-end: var(--size-2-2);

    /* Buttons start invisible and are shown when the card is hovered */
    opacity: 0;

    .link-card-contents-wrapper:hover & {
      opacity: 1;
    }

    :global(.clickable-icon) {
      --cursor: pointer;
    }
  }
</style>
