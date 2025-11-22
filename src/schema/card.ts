import * as z from "zod/mini";
import Result from "true-myth/result";
import { of as maybeOf } from "true-myth/maybe";
import { type StandardSchemaV1, parserFor } from "true-myth/standard-schema";

import { ImageLink } from "./image-link";
import type { CardStructure } from "./card-structure";

const MaybeString = z.pipe(
  z.optional(z.string()),
  z.transform((value) => maybeOf(value)),
);

type MaybeString = z.infer<typeof MaybeString>;

export type MaybeStringResult = Result<MaybeString, string[]>;

const MaybeImageLink = z.pipe(
  z.optional(ImageLink),
  z.transform((value) => maybeOf(value)),
);

const parseString = parserFor(MaybeString);

type MaybeImageLink = z.infer<typeof MaybeImageLink>;

export type MaybeImageLinkResult = Result<MaybeImageLink, string[]>;

export const parseImageProperty = parserFor(MaybeImageLink);

/**
 * The properties of the card to render, as extracted from a data
 * provider
 *
 * Data in this structure might not directly be ready for rendering.
 * E.g. image references still need to be resolved to usable URLs
 */
export interface Card {
  title: MaybeStringResult;
  description: MaybeStringResult;
  url: MaybeStringResult;
  image: MaybeImageLinkResult;
  favicon: MaybeImageLinkResult;
}

export function getFailureResultMessages(
  error: StandardSchemaV1.FailureResult,
): string[] {
  return error.issues.map((issue) => issue.message);
}

/**
 * Parses the input to generate a {@linkcode Card}
 *
 * @param cardProps
 * @returns
 */
export function fromCardStructure(structure: CardStructure): Card {
  return {
    title: parseString(structure.title).mapErr(getFailureResultMessages),
    description: parseString(structure.description).mapErr(
      getFailureResultMessages,
    ),
    url: parseString(structure.url).mapErr(getFailureResultMessages),
    image: parseImageProperty(structure.image).mapErr(getFailureResultMessages),
    favicon: parseImageProperty(structure.favicon).mapErr(
      getFailureResultMessages,
    ),
  };
}
