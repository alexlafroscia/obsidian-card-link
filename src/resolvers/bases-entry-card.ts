import { App, BasesEntry, BasesPropertyId, BasesViewConfig } from "obsidian";
import Result, { ok, err } from "true-myth/result";

import { makeOnClickHandler } from "./file-card";
import { resolveImageLink } from "./image-link";
import { InternalLinkProps } from "../components/link-card";
import { parseImageLink } from "../schema/image-link";
import {
  type ConfigKey,
  getAsValidPropertyId,
} from "../bases-views/file-card-list-config";

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
): InternalLinkProps {
  const { file } = entry;

  const title = getValueForProperty("title", config, entry).unwrapOr("");

  const urlResult = getValueForProperty("url", config, entry);
  const url = urlResult.unwrapOr(undefined);

  const host = getValueForProperty("host", config, entry)
    .orElse(() =>
      urlResult.map((url) => {
        const parsedUrl = new URL(url);

        return parsedUrl.hostname;
      }),
    )
    .unwrapOr(undefined);

  const description = getValueForProperty(
    "description",
    config,
    entry,
  ).unwrapOr(undefined);

  const image = getValueForProperty("image", config, entry)
    .andThen((imagePropertyValue) => parseImageLink(imagePropertyValue))
    .andThen((imageLink) => resolveImageLink(imageLink, app))
    .unwrapOr(undefined);

  const favicon = getValueForProperty("favicon", config, entry)
    .andThen((imagePropertyValue) => parseImageLink(imagePropertyValue))
    .andThen((imageLink) => resolveImageLink(imageLink, app))
    .unwrapOr(undefined);

  return {
    title,
    url,
    host,
    description,
    image,
    favicon,
    indent: 0,
    onClick: makeOnClickHandler(file, app),
  } satisfies InternalLinkProps;
}
