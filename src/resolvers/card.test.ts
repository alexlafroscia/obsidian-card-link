import * as assert from "node:assert";
import { describe, test } from "node:test";

import { enhanceCard } from "./card";

const DUMMY_CARD = {
  title: "Dummy Card",
  url: "https://example.com/first/second",
  host: "example.com",
};

describe("enhanceCard", function () {
  describe("ensuring a host is provided", () => {
    test("when a host already exists", () => {
      const result = enhanceCard({
        ...DUMMY_CARD,
        host: "different.com",
      });

      assert.deepEqual(result, {
        ...DUMMY_CARD,
        host: "different.com",
      });
    });

    test("when a host needs to be defined", () => {
      const result = enhanceCard({
        ...DUMMY_CARD,
        host: undefined,
      });

      assert.deepEqual(result, {
        ...DUMMY_CARD,
        host: "example.com",
      });
    });
  });
});
