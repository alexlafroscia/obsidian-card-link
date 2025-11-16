import * as z from "zod/mini";

import { InternalLink } from "./internal-link";
import { makeSchemaParser } from "./make-schema-parser";

export const ExternalImageLink = z.codec(
  z.url("Value must be a URL"),
  z.object({
    type: z.literal("external"),
    value: z.url(),
  }),
  {
    decode(value) {
      return { type: "external" as const, value };
    },
    encode({ value }) {
      return value;
    },
  },
);

export const ImageLink = z.union(
  [InternalLink, ExternalImageLink],
  "Value must be an external image URL or an internal image link",
);

export type ImageLink = z.infer<typeof ImageLink>;

export const parseImageLink = makeSchemaParser(ImageLink);
