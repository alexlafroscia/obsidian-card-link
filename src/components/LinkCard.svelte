<script lang="ts">
  import Maybe, { nothing } from "true-myth/maybe";

  import type { CommonCardProps } from "./common";

  export type LinkCardProps = CommonCardProps;

  import CardContents from "./CardContents.svelte";
  import CardContainer from "./CardContainer.svelte";

  let cardProps: LinkCardProps = $props();

  let href = cardProps.url
    .match<Maybe<string>>({
      Err: () => nothing(),
      Ok: (maybeUrl) => maybeUrl,
    })
    .unwrapOr(undefined);
</script>

<CardContainer {...cardProps}>
  {#snippet children(containerButtons)}
    <a class="auto-card-link-card" {href}>
      <CardContents {...cardProps}>
        {#snippet buttons()}
          {@render containerButtons()}
        {/snippet}
      </CardContents>
    </a>
  {/snippet}
</CardContainer>
