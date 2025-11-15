import { App, BasesEntry, BasesPropertyId } from "obsidian";
import Result, { ok, err } from "true-myth/result";

import { makeOnClickHandler } from "./file-card";
import { resolveImageLink } from "./image-link";
import { InternalLinkProps } from "../components/link-card";
import { parseImageLink } from "../schema/image-link";

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

export function resolveBasesEntryCardProps(
  entry: BasesEntry,
  app: App,
): InternalLinkProps {
  const { file } = entry;

  const title = getValue(entry, "note.title").unwrapOr(file.basename);

  const urlResult = getValue(entry, "note.url");
  const url = urlResult.unwrapOr(undefined);
  const host = getValue(entry, "note.host")
    .match({
      Ok: (host) => ok(host),
      Err: () =>
        urlResult.map((url) => {
          const parsedUrl = new URL(url);

          return parsedUrl.host;
        }),
    })
    .unwrapOr(undefined);

  const description = getValue(entry, "note.description").unwrapOr(undefined);

  const image = getValue(entry, "note.image")
    .andThen((imagePropertyValue) => parseImageLink(imagePropertyValue))
    .andThen((imageLink) => resolveImageLink(imageLink, app))
    .unwrapOr(undefined);

  const favicon = getValue(entry, "note.favicon")
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
