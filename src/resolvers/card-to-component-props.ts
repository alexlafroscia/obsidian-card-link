import type { App } from "obsidian";

import type { LinkCard } from "../components/common";
import type { Card } from "../schema/card";

import { extractImageProperties } from "./image-link";

export function resolveComponentPropsFromCard(
  contents: Card,
  app: App,
): LinkCard {
  return {
    ...contents,
    ...extractImageProperties(contents, app),
  };
}
