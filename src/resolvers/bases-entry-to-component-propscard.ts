import { App, BasesEntry, BasesPropertyId, BasesViewConfig } from "obsidian";
import Result, { ok, err } from "true-myth/result";

import {
  type ConfigKey,
  getAsValidPropertyId,
} from "../bases-views/file-card-list-config";
import type { FileCardProps } from "../components/file-card";
import { parseCard } from "../schema/card";

import { enhanceCard } from "./card";
import { makeOnClickHandler } from "./file-to-component-props";
import { resolveImageProperties } from "./image-link";

function getValue(
  entry: BasesEntry,
  property: BasesPropertyId,
): Result<string, string> {
  const value = entry.getValue(property);

  if (!value) {
    return err(`\$${property}\$ could not be retreived`);
  }

  if (!value.isTruthy()) {
    return err(`\$${property}\$ could be retreived, but has a "falsey" value`);
  }

  return ok(value.toString());
}

function getValueForProperty(
  key: ConfigKey,
  config: BasesViewConfig,
  entry: BasesEntry,
) {
  return ok(getAsValidPropertyId(config, key)).andThen((propertyId) =>
    getValue(entry, propertyId),
  );
}

export function resolveBasesEntryCardProps(
  entry: BasesEntry,
  config: BasesViewConfig,
  app: App,
): Result<FileCardProps, string> {
  const { file } = entry;

  const title = getValueForProperty("title", config, entry).unwrapOr("");

  const url = getValueForProperty("url", config, entry).unwrapOr(undefined);
  const host = getValueForProperty("host", config, entry).unwrapOr(undefined);

  const description = getValueForProperty(
    "description",
    config,
    entry,
  ).unwrapOr(undefined);

  return parseCard({
    title,
    url,
    host,
    description,
    image: getValueForProperty("image", config, entry).unwrapOr(undefined),
    favicon: getValueForProperty("favicon", config, entry).unwrapOr(undefined),
  }).map((card) => ({
    ...card,
    ...enhanceCard(card),
    ...resolveImageProperties(card, app),
    onClick: makeOnClickHandler(file, app),
  }));
}
