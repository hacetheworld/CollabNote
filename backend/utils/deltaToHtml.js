import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

export function convertDeltaToHTML(delta) {
  const converter = new QuillDeltaToHtmlConverter(delta.ops, {
    inlineStyles: true,
  });

  return converter.convert();
}
