import Maybe, { of as maybeOf, just } from "true-myth/maybe";
import Result, { safe } from "true-myth/result";

import type { CardStructure } from "../schema/card-structure";

export type LinkMetadata = Record<keyof CardStructure, Maybe<string>>;

function getContent(node: Element): Maybe<string> {
  return maybeOf(node.getAttribute("content"));
}

function getHref(node: Element): Maybe<string> {
  return maybeOf(node.getAttribute("href"));
}

function getOgTitle(doc: Document): Maybe<string> {
  return maybeOf(doc.querySelector("meta[property='og:title']")).andThen(
    getContent,
  );
}

function getTitle(doc: Document): Maybe<string> {
  return maybeOf(doc.querySelector("title")).map(
    (titleNode) => titleNode.textContent,
  );
}

function getOgDescription(doc: Document): Maybe<string> {
  return maybeOf(doc.querySelector("meta[property='og:description']")).andThen(
    getContent,
  );
}

function getDescription(doc: Document): Maybe<string> {
  return maybeOf(doc.querySelector("meta[name='description']")).andThen(
    getContent,
  );
}

function getFavicon(doc: Document): Maybe<string> {
  return maybeOf(doc.querySelector("link[rel='icon']")).andThen(getHref);
}

function getOgImage(doc: Document): Maybe<string> {
  return maybeOf(doc.querySelector("meta[property='og:image']")).andThen(
    getContent,
  );
}

export function parse(url: string, html: string): Result<LinkMetadata, string> {
  const parser = new DOMParser();
  const safeParseFromString = safe(
    parser.parseFromString.bind(parser),
    (exception) => {
      if (exception instanceof Error) {
        return `${exception.name}: ${exception.message}`;
      } else {
        return "Could not parse the document as HTML";
      }
    },
  );

  const parseResult = safeParseFromString(html, "text/html");

  return parseResult.map((doc) => {
    return {
      url: just(url),
      title: getOgTitle(doc)
        .orElse(() => getTitle(doc))
        .map((title) => {
          return title
            .replace(/\r\n|\n|\r/g, "")
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .trim();
        }),
      description: getOgDescription(doc)
        .orElse(() => getDescription(doc))
        .map((description) => {
          return description
            .replace(/\r\n|\n|\r/g, "")
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .trim();
        }),
      image: getOgImage(doc),
      favicon: getFavicon(doc),
    };
  });
}
