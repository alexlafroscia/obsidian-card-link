import * as assert from "node:assert";
import { test } from "node:test";

import { parseLinkMetadataFromJSON } from "./code_block_parser";

test("ensuring a link has a url and title", () => {
  assert.ok(parseLinkMetadataFromJSON({}).isErr);

  assert.ok(
    parseLinkMetadataFromJSON({
      url: "https://foobar.com",
    }).isErr,
  );

  assert.ok(
    parseLinkMetadataFromJSON({
      title: "foo bar",
    }).isErr,
  );

  assert.ok(
    parseLinkMetadataFromJSON({
      url: "https://foobar.com",
      title: "foo bar",
    }).isOk,
  );
});
