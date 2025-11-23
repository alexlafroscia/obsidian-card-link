import * as assert from "node:assert";
import { test } from "node:test";
import { parserFor } from "true-myth/standard-schema";

import { InternalLink } from "./internal-link";

const parseInternalLink = parserFor(InternalLink);

test("when the value is a normal string", () => {
  const result = parseInternalLink("foobar");

  assert.ok(result.isErr);
  assert.equal(
    result.error.issues[0].message,
    "Value must be an internal Obsidian link",
  );
});

test("when the value is an quoted link", () => {
  const result = parseInternalLink("[[FooBar]]");

  assert.ok(result.isOk);
  assert.deepEqual(result.value, {
    type: "internal",
    value: "FooBar",
  });
});

test("when the value is a unquoted link", () => {
  // An "unquoted" link, in YAML syntax, is actually a nested tuple;
  // it just LOOKS like an unquoted link
  const result = parseInternalLink([["FooBar"]]);

  assert.ok(result.isOk);
  assert.deepEqual(result.value, {
    type: "internal",
    value: "FooBar",
  });
});
