import { Editor, requestUrl, type EditorPosition } from "obsidian";
import Task, { fromPromise } from "true-myth/task";
import { ok, err } from "true-myth/result";
import Maybe, { just, nothing } from "true-myth/maybe";

import { EditorExtensions } from "src/editor_enhancements";

import { type LinkMetadata, parse } from "./link-metadata-parser";
import { serialize } from "./link-metadata-serializer";

function getPosition(
  editor: Editor,
  value: string,
): Maybe<{ start: EditorPosition; end: EditorPosition }> {
  const text = editor.getValue();
  const start = text.indexOf(value);

  if (start < 0) {
    return nothing();
  }

  const end = start + value.length;

  return just({
    start: EditorExtensions.getEditorPositionFromIndex(text, start),
    end: EditorExtensions.getEditorPositionFromIndex(text, end),
  });
}

function createBlockHash(): string {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function fetchLinkMetadata(url: string): Task<LinkMetadata, string> {
  return fromPromise(requestUrl({ url }))
    .mapRejected((res) => {
      let message = `An error occurred while fetching ${url}`;

      if (res instanceof Error) {
        message += `: ${res.message}`;
      }

      if (typeof res === "string") {
        message += `: ${res}`;
      }

      return message;
    })
    .andThen((res) => {
      if (res.status !== 200) {
        return err(`Request for ${url} resulted in status code ${res.status}`);
      } else {
        return ok(res);
      }
    })
    .andThen((res) => {
      return parse(url, res.text);
    });
}

export function convertUrlToCodeBlock(
  editor: Editor,
  url: string,
): Task<undefined, string> {
  const selectedText = editor.getSelection();

  // Generate a unique id for find/replace operations.
  const pasteId = createBlockHash();
  const fetchingText = `[Fetching Data#${pasteId}](${url})`;

  // Instantly paste so you don't wonder if paste is broken
  editor.replaceSelection(fetchingText);

  return (
    fetchLinkMetadata(url)
      // Try to revert the change if fetching the metadata failed
      .mapRejected((err) => {
        const position = getPosition(editor, fetchingText);
        if (position.isJust) {
          const { start, end } = position.value;
          editor.replaceRange(selectedText || url, start, end);
        }

        return err;
      })
      .andThen((linkMetadata) => {
        const position = getPosition(editor, fetchingText);

        // If the document changed and we no longer can find the fetching indicator,
        // bail out; don't bother to revert the indicator because we couldn't find it
        if (position.isNothing) {
          return err(
            `Unable to find text "${fetchingText}" in current editor, bailing out; link ${url}`,
          );
        }

        const { start, end } = position.value;
        const codeblock = "\n" + serialize(linkMetadata) + "\n";

        editor.replaceRange(codeblock, start, end);

        return ok(undefined);
      })
  );
}
