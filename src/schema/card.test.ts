import * as assert from "node:assert";
import { describe, test } from "node:test";

import { fromCardStructure } from "./card";

describe("fromCardStructure", () => {
  describe("string property parsing", () => {
    test("when the property value is `undefined`", () => {
      const card = fromCardStructure({
        description: undefined,
      });

      assert.ok(card.description.isOk);
      assert.ok(card.description.value.isNothing);
    });

    test("when the property value is `null`", () => {
      const card = fromCardStructure({
        description: null,
      });

      assert.ok(card.description.isOk);
      assert.ok(card.description.value.isNothing);
    });

    test("when the property is missing", () => {
      const card = fromCardStructure({});

      assert.ok(card.description.isOk);
      assert.ok(card.description.value.isNothing);
    });

    test("when the property is present", () => {
      const card = fromCardStructure({
        description: "foobar",
      });

      assert.ok(card.description.isOk);
      assert.ok(card.description.value.isJust);
      assert.equal(card.description.value.value, "foobar");
    });
  });
});
