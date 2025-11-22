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

export const InternalLink = z.codec(
  z.union(
    [QuotedInternalLink, UnquotedInternalLink],
    "Value must be an internal Obsidian link",
  ),
  z.object({
    type: z.literal("internal"),
    value: z.string(),
  }),
  {
    decode(value) {
      return { type: "internal" as const, value };
    },
    encode(value) {
      return `"[[${value}]]"`;
    },
  },
);

export type InternalLink = z.infer<typeof InternalLink>;
