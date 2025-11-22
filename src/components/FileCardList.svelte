<script lang="ts" module>
  import type { FileCard as FileCardModel } from "./common";
  import FileCard from "./FileCard.svelte";

  export interface Props {
    cards: FileCardModel[];
  }
</script>

<script lang="ts">
  let { cards }: Props = $props();
</script>

<ul>
  {#each cards as card}
    <li>
      <FileCard {card} />
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;

    /* Override default `ul` spacing inside rendered markdown */
    margin-block-start: 0;
    margin-block-end: 0;
  }

  li {
    /* Avoid indenting the list contents */
    margin-inline-start: 0 !important;
  }

  li + li {
    margin-block-start: var(--p-spacing);
  }
</style>
