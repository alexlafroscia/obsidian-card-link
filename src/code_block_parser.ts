import { parserFor } from "true-myth/standard-schema";

import { LinkMetadata } from "./types";

const codeblockContentsParser = parserFor(LinkMetadata);

export function parseLinkMetadataFromJSON(linkMetadata: unknown) {
  return codeblockContentsParser(linkMetadata);
}
