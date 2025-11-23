import * as z from "zod/mini";

const QuotedInternalLink = z.pipe(
  z.stringFormat(
    "quoted-internal-link",
    (value) => {
      return value.startsWith("[[") && value.endsWith("]]");
    },
    {
      error: "Value must be an quoted Obsidian internal link",
    },
  ),
  z.transform((valueWithBrackets) => {
    return valueWithBrackets.replace("[[", "").replace("]]", "");
  }),
);

const UnquotedInternalLink = z.pipe(
  z.tuple([z.tuple([z.string()])]),
  z.transform((value) => {
    const [[file]] = value;

    return file;
  }),
);

export const InternalLink = z.pipe(
  z.union(
    [QuotedInternalLink, UnquotedInternalLink],
    "Value must be an internal Obsidian link",
  ),
  z.transform((value) => {
    return {
      type: "internal" as const,
      value,
    };
  }),
);

export type InternalLink = z.infer<typeof InternalLink>;
