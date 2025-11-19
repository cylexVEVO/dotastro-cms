export type FsNode = {
  name: string;
  path: string;
  children: FsNode[];
  is_file: boolean;
};

export const textTags = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "mark",
  "small",
  "sub",
  "sup",
  "code",
  "kbd",
  "samp",
  "var",
  "pre",
  "blockquote",
  "cite",
  "q",
  "abbr",
  "dfn",
  "time",
  "li",
  "dt",
  "dd",
  "label",
  "legend",
  "caption",
  "figcaption",
  "td",
  "th",
  "address",
  "div",
];

export type AddBlockMode = "above" | "below" | "inside";
