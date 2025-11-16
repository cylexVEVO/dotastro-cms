// this is a monarch grammar that sonnet 4.5
// one-shot, it has issues but works well enough

import type { languages } from "monaco-editor";

export const astroLanguageDefinition: languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".astro",

  // Astro-specific directives and attributes
  astroDirectives: [
    "client:load",
    "client:idle",
    "client:visible",
    "client:media",
    "client:only",
    "set:html",
    "set:text",
    "is:raw",
    "is:inline",
    "define:vars",
  ],

  keywords: [
    "import",
    "export",
    "default",
    "const",
    "let",
    "var",
    "function",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "throw",
    "try",
    "catch",
    "finally",
    "class",
    "extends",
    "new",
    "this",
    "super",
    "typeof",
    "instanceof",
    "void",
    "delete",
    "in",
    "of",
  ],

  typeKeywords: [
    "boolean",
    "number",
    "string",
    "object",
    "any",
    "unknown",
    "never",
    "void",
    "null",
    "undefined",
  ],

  operators: [
    "=",
    ">",
    "<",
    "!",
    "~",
    "?",
    ":",
    "==",
    "<=",
    ">=",
    "!=",
    "&&",
    "||",
    "++",
    "--",
    "+",
    "-",
    "*",
    "/",
    "&",
    "|",
    "^",
    "%",
    "<<",
    ">>",
    ">>>",
    "+=",
    "-=",
    "*=",
    "/=",
    "&=",
    "|=",
    "^=",
    "%=",
    "<<=",
    ">>=",
    ">>>=",
    "=>",
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,

  tokenizer: {
    root: [
      // Frontmatter section (TypeScript/JavaScript between ---)
      [
        /^---$/,
        {
          token: "delimiter.frontmatter",
          next: "@frontmatter",
          nextEmbedded: "typescript",
        },
      ],

      // HTML Comments
      [/<!--/, "comment", "@comment"],

      // JSX-like expressions
      [/{/, { token: "delimiter.bracket", next: "@expression" }],

      // Script tags
      [/(<)(script)/, ["delimiter", { token: "tag", next: "@script" }]],

      // Style tags
      [/(<)(style)/, ["delimiter", { token: "tag", next: "@style" }]],

      // Component or HTML tags
      [/(<)([\w-]+)/, ["delimiter", { token: "tag", next: "@tag" }]],
      [/(<\/)([\w-]+)(\s*)(>)/, ["delimiter", "tag", "", "delimiter"]],

      // Self-closing tags
      [
        /(<)([\w-]+)(\s*)(\/?)(\s*)(>)/,
        ["delimiter", "tag", "", "delimiter", "", "delimiter"],
      ],

      // Text content
      [/[^<{]+/, "text"],
    ],

    frontmatter: [
      [
        /^---$/,
        {
          token: "delimiter.frontmatter",
          next: "@pop",
          nextEmbedded: "@pop",
        },
      ],
    ],

    comment: [
      [/[^-]+/, "comment"],
      [/-->/, "comment", "@pop"],
      [/-/, "comment"],
    ],

    tag: [
      // Astro directives
      [/(client:|set:|is:|define:)(\w+)/, ["attribute.name", "attribute.name"]],

      // Regular attributes
      [/[\w-]+/, "attribute.name", "@attributeValue"],

      // Spread attributes {...props}
      [/{\.\.\./, { token: "delimiter.bracket", next: "@expression" }],

      [/>/, "delimiter", "@pop"],
      [/\/?>/, "delimiter", "@pop"],

      [/\s+/, ""],
    ],

    attributeValue: [
      [/=/, "delimiter"],
      [/"([^"]*)"/, "attribute.value", "@pop"],
      [/'([^']*)'/, "attribute.value", "@pop"],
      [
        /{/,
        {
          token: "delimiter.bracket",
          next: "@expression",
          nextEmbedded: "typescript",
        },
      ],
      [/[^\s>]+/, "attribute.value", "@pop"],
      [/(?=>)/, "", "@pop"],
    ],

    expression: [
      [/{/, "delimiter.bracket", "@expression"],
      [
        /}/,
        {
          token: "delimiter.bracket",
          next: "@pop",
          nextEmbedded: "@pop",
        },
      ],

      // TypeScript/JavaScript content
      [
        /@symbols/,
        {
          cases: {
            "@operators": "operator",
            "@default": "",
          },
        },
      ],

      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            "@keywords": "keyword",
            "@typeKeywords": "type",
            "@default": "identifier",
          },
        },
      ],

      [/@digits/, "number"],
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/'([^'\\]|\\.)*$/, "string.invalid"],
      [/"/, "string", "@string_double"],
      [/'/, "string", "@string_single"],
      [/`/, "string", "@string_backtick"],

      [/[;,.]/, "delimiter"],
      [/[()[\]]/, "@brackets"],
    ],

    string_double: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, "string", "@pop"],
    ],

    string_single: [
      [/[^\\']+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/'/, "string", "@pop"],
    ],

    string_backtick: [
      [/\$\{/, { token: "delimiter.bracket", next: "@expression" }],
      [/[^\\`$]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/`/, "string", "@pop"],
    ],

    script: [
      [/type/, "attribute.name", "@scriptAttributeValue"],
      [/>/, "delimiter", "@scriptBody"],
      [/[\w-]+/, "attribute.name", "@attributeValue"],
      [/\s+/, ""],
    ],

    scriptAttributeValue: [
      [/=/, "delimiter"],
      [/"([^"]*)"/, "attribute.value", "@pop"],
      [/'([^']*)'/, "attribute.value", "@pop"],
      [/(?=>)/, "", "@pop"],
    ],

    scriptBody: [
      [
        /<\/script>/,
        { token: "delimiter", next: "@pop", nextEmbedded: "@pop" },
      ],
      [
        /[^<]+/,
        {
          token: "@rematch",
          next: "@pop",
          nextEmbedded: "typescript",
        },
      ],
    ],

    style: [
      [/type|lang/, "attribute.name", "@styleAttributeValue"],
      [/>/, "delimiter", "@styleBody"],
      [/[\w-]+/, "attribute.name", "@attributeValue"],
      [/\s+/, ""],
    ],

    styleAttributeValue: [
      [/=/, "delimiter"],
      [/"([^"]*)"/, "attribute.value", "@pop"],
      [/'([^']*)'/, "attribute.value", "@pop"],
      [/(?=>)/, "", "@pop"],
    ],

    styleBody: [
      [/<\/style>/, { token: "delimiter", next: "@pop", nextEmbedded: "@pop" }],
      [/[^<]+/, { token: "@rematch", next: "@pop", nextEmbedded: "css" }],
    ],
  },
};

// Configuration for the language
export const astroLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    blockComment: ["<!--", "-->"],
    lineComment: "//",
  },
  brackets: [
    ["<", ">"],
    ["{", "}"],
    ["(", ")"],
    ["[", "]"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "`", close: "`" },
    { open: "<", close: ">", notIn: ["string"] },
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "`", close: "`" },
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "<", close: ">" },
  ],
  folding: {
    markers: {
      start: /^\s*<!--\s*#region\b.*-->/,
      end: /^\s*<!--\s*#endregion\b.*-->/,
    },
  },
};
