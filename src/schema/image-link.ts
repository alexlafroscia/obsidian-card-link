import * as z from "zod/mini";

import { InternalLink } from "./internal-link";
import { makeSchemaParser } from "./make-schema-parser";

const AbsoluteExternalImageLink = z.codec(
  z.url("Value must be an absolute URL"),
  z.object({
    type: z.literal("absolute"),
    value: z.httpUrl(),
  }),
  {
    decode(value) {
      return { type: "absolute" as const, value };
    },
    encode({ value }) {
      return value;
    },
  },
);

export const URLPath = z.templateLiteral(
  ["/", z.string()],
  "Value must be a URL path (`/...`)",
);

export type URLPath = z.infer<typeof URLPath>;

export const RelativeExternalImageLink = z.codec(
  URLPath,
  z.object({
    type: z.literal("relative"),
    value: URLPath,
  }),
  {
    decode(value) {
      return { type: "relative" as const, value };
    },
    encode({ value }) {
      return value;
    },
  },
);

export const ImageLink = z.union(
  [InternalLink, AbsoluteExternalImageLink, RelativeExternalImageLink],
  "Value must be an image URL or internal link",
);

export type ImageLink = z.infer<typeof ImageLink>;

export const parseImageLink = makeSchemaParser(ImageLink);
