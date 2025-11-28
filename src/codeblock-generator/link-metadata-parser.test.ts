import { afterEach, beforeEach, describe, test } from "node:test";
import * as assert from "node:assert";
import globalJSDom from "global-jsdom";
import dedent from "dedent";

import { parse } from "./link-metadata-parser";

let cleanup: () => void;

beforeEach(() => {
  cleanup = globalJSDom();
});

afterEach(() => {
  cleanup();
});

describe("extracting the title", () => {
  test("reading the document OpenGraph title", () => {
    const result = parse(
      "https://foobar.com",
      dedent`
      <html>
        <head>
          <meta property="og:title" content="This is a test" />
        </head>
      </html>   
    `,
    );

    assert.ok(result.isOk);
    assert.ok(result.value.title.isJust);
    assert.equal(result.value.title.value, "This is a test");
  });

  test("reading the document title", () => {
    const result = parse(
      "https://foobar.com",
      dedent`
      <html>
        <head>
          <title>This is a test</title>
        </head>
      </html>   
    `,
    );

    assert.ok(result.isOk);
    assert.ok(result.value.title.isJust);
    assert.equal(result.value.title.value, "This is a test");
  });
});
