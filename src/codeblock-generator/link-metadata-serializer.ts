import { stringifyYaml } from "obsidian";

import type { LinkMetadata } from "./link-metadata-parser";

export function serialize(meta: LinkMetadata): string {
  const props: Partial<Record<keyof LinkMetadata, string>> = {};

  for (const [key, maybeValue] of Object.entries(meta)) {
    if (maybeValue.isJust) {
      props[key as keyof LinkMetadata] = maybeValue.value;
    }
  }

  return ["```cardlink\n", stringifyYaml(props), "```"].join("");
}
