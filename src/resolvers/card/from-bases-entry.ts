import type {
  App,
  BasesEntry,
  BasesPropertyId,
  BasesViewConfig,
} from "obsidian";
import Result, { ok, err } from "true-myth/result";
import Maybe, { just, nothing } from "true-myth/maybe";

import {
  type ConfigKey,
  getAsValidPropertyId,
} from "../../bases-views/file-card-list-config";
import type { FileCardProps } from "../../components/FileCard.svelte";
import {
  type Card,
  getFailureResultMessages,
  parseImageProperty,
} from "../../schema/card";

import { makeOnClickHandler } from "./from-frontmatter";
import { extractImageProperties } from "../image-link";

function getValue(
  entry: BasesEntry,
  property: BasesPropertyId,
): Result<Maybe<string>, string[]> {
  const value = entry.getValue(property);

  if (!value) {
    return err([`\$${property}\$ could not be retreived`]);
  }

  if (!value.isTruthy()) {
    return ok(nothing());
  }

  return ok(just(value.toString()));
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

function extractImageLink(maybeImage: Maybe<string>) {
  return parseImageProperty(maybeImage.unwrapOr(undefined)).mapErr(
    getFailureResultMessages,
  );
}

export function extractCardFromBasesEntry(
  entry: BasesEntry,
  config: BasesViewConfig,
): Card {
  return {
    title: getValueForProperty("title", config, entry),
    description: getValueForProperty("description", config, entry),
    url: getValueForProperty("url", config, entry),
    image: getValueForProperty("image", config, entry).andThen(
      extractImageLink,
    ),
    favicon: getValueForProperty("favicon", config, entry).andThen(
      extractImageLink,
    ),
  };
}

export function resolveBasesEntryCardProps(
  entry: BasesEntry,
  config: BasesViewConfig,
  app: App,
): FileCardProps {
  const card = extractCardFromBasesEntry(entry, config);
  const { file } = entry;

  return {
    ...card,
    ...extractImageProperties(card, app),
    onClick: makeOnClickHandler(file, app),
  };
}
