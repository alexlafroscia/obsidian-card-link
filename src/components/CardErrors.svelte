<script lang="ts" module>
  import type { CardProp, LinkCard } from "./common";
  import Error from "./Error.svelte";

  type CardPropErrors = Record<keyof LinkCard, string[]>;

  function extractPropErrors(prop: CardProp): string[] {
    return prop.isErr ? prop.error : [];
  }

  function extractErrors(card: LinkCard): CardPropErrors {
    return {
      title: extractPropErrors(card.title),
      description: extractPropErrors(card.description),
      favicon: extractPropErrors(card.favicon),
      image: extractPropErrors(card.image),
      url: extractPropErrors(card.url),
    };
  }
</script>

<script lang="ts">
  interface Props {
    card: LinkCard;
  }

  let { card }: Props = $props();

  let entries = $derived(
    Object.entries(extractErrors(card))
      // Remove entries without any errors
      .filter(([_property, errors]) => errors.length > 0)
  );
</script>

<Error>
  <dl>
    {#each entries as [property, errors]}
      <dt>{property}</dt>
      <dd>
        <ul>
          {#each errors as error}
            <li>{error}</li>
          {/each}
        </ul>
      </dd>
    {/each}
  </dl>
</Error>

<style>
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  dd {
    margin-inline-start: unset;
  }

  ul {
    --p-spacing: 0;
  }
</style>
