import * as z from "zod/mini";

import { makeSchemaParser } from "./make-schema-parser";
import { InternalLink } from "./internal-link";
import { ImageLink } from "./image-link";

export const FileEmbedContents = z.object({
  file: z.union([z.literal("self"), InternalLink]),
});

export type FileEmbedContents = z.infer<typeof FileEmbedContents>;

export const LinkEmbedContents = z.object({
  title: z.string("A title must be provided"),
  url: z.string("A URL must be provided"),
  description: z.optional(z.coerce.string()),
  image: z.optional(ImageLink),
  host: z.optional(z.string()),
  favicon: z.optional(ImageLink),
});

export type LinkEmbedContents = z.infer<typeof LinkEmbedContents>;

export const parseLinkEmbedContents = makeSchemaParser(LinkEmbedContents);

export const CodeblockContents = z.union([
  FileEmbedContents,
  LinkEmbedContents,
]);

export type CodeblockContents = z.infer<typeof CodeblockContents>;

export const parseCodeblockContents = makeSchemaParser(CodeblockContents);
