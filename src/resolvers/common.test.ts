import * as assert from "node:assert";
import { describe, test } from "node:test";

import { ensureFaviconHasHost } from "./common";

describe("ensureFaviconHasHost", function () {
  test("adding the URL hostname if missing", () => {
    const favicon = ensureFaviconHasHost(
      "/foo.ico",
      "https://foobar.com/foo/bar",
    );

    assert.equal(favicon, "https://foobar.com/foo.ico");
  });

  test("doing nothing if the favicon already has a host", () => {
    const favicon = ensureFaviconHasHost(
      "https://bar.com/foo.ico",
      "https://foo.com/foo/bar",
    );

    assert.equal(favicon, "https://bar.com/foo.ico");
  });
});
