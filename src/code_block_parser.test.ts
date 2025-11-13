import * as assert from "node:assert";
import { test } from "node:test";

import { parseLinkMetadataFromJSON } from "./code_block_parser";

test("ensuring a link had a url and title", () => {
  assert.throws(() => {
    parseLinkMetadataFromJSON({});
  });

  assert.throws(() => {
    parseLinkMetadataFromJSON({
      url: "https://foobar.com",
    });
  });

  assert.throws(() => {
    parseLinkMetadataFromJSON({
      title: "foo bar",
    });
  });

  assert.deepEqual(
    parseLinkMetadataFromJSON({
      url: "https://foobar.com",
      title: "foo bar",
    }),
    {
      url: "https://foobar.com",
      title: "foo bar",
      description: undefined,
      favicon: undefined,
      host: undefined,
      image: undefined,
    },
  );
});
