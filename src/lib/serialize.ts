// this is directly from claude (with minor fixes), i can't be fucked to write this by hand
import type {
  AttributeNode,
  Node,
  RootNode,
  TagLikeNode,
} from "./astro-compiler/shared/ast";

interface SerializeOptions {
  indent?: string;
  currentIndent?: string;
}

export function astToString(ast: Node, options: SerializeOptions = {}): string {
  const { indent = "  ", currentIndent = "" } = options;

  if (!ast) return "";

  switch (ast.type) {
    case "root":
      return ast.children.map((child) => astToString(child, options)).join("");

    case "fragment":
      return ast.children.map((child) => astToString(child, options)).join("");

    case "frontmatter":
      return `---${ast.value}---\n\n`;

    case "element":
      return serializeElement(ast, options);

    case "component":
      return serializeElement(ast, options);

    case "custom-element":
      return serializeElement(ast, options);

    case "text":
      return ast.value || "";

    case "expression":
      return `{${ast.children
        .map((child) => astToString(child, options))
        .join("")}}`;

    case "comment":
      return `<!--${ast.value || ""}-->`;

    case "doctype":
      return `<!DOCTYPE ${ast.value || "html"}>`;

    default:
      console.warn(`Unknown node type: ${(ast as any).type}`);
      return "";
  }
}

function serializeElement(
  node: TagLikeNode,
  options: SerializeOptions,
): string {
  const { indent = "  ", currentIndent = "" } = options;
  const tagName = node.name;

  if (!tagName) return "";

  // Serialize attributes
  const attrs = serializeAttributes(node.attributes || []);
  const attrString = attrs.length > 0 ? " " + attrs : "";

  // Self-closing tags
  const selfClosing = isSelfClosing(tagName);
  const hasChildren = node.children && node.children.length > 0;

  if (selfClosing && !hasChildren) {
    return `${currentIndent}<${tagName}${attrString} />`;
  }

  // Empty element with explicit closing tag
  if (!hasChildren) {
    return `${currentIndent}<${tagName}${attrString}></${tagName}>`;
  }

  // Element with children
  const childIndent = currentIndent + indent;
  const children = node.children
    .map((child) => {
      // Check if child needs its own line
      if (needsNewline(child)) {
        return astToString(child, {
          ...options,
          currentIndent: childIndent,
        });
      }
      return astToString(child, options);
    })
    .join("");

  // Determine if we should format with newlines
  const shouldFormatBlock = node.children.some(needsNewline);

  if (shouldFormatBlock) {
    return `${currentIndent}<${tagName}${attrString}>\n${children}\n${currentIndent}</${tagName}>`;
  }

  return `${currentIndent}<${tagName}${attrString}>${children}</${tagName}>`;
}

function serializeAttributes(attributes: AttributeNode[]): string {
  return attributes
    .map((attr) => {
      if (attr.type === "attribute") {
        const name = attr.name;

        // Boolean attribute
        if (attr.kind === "empty") {
          return name;
        }

        // Expression attribute
        if (attr.kind === "expression") {
          return `${name}={${attr.value}}`;
        }

        // Spread attribute
        if (attr.kind === "spread") {
          return `{...${attr.value}}`;
        }

        // Template literal attribute
        if (attr.kind === "template-literal") {
          return `${name}={\`${attr.value}\`}`;
        }

        // Quoted attribute
        const quote = attr.raw?.startsWith("'") ? "'" : '"';
        return `${name}=${quote}${escapeAttributeValue(attr.value || "", quote)}${quote}`;
      }

      if (attr.type === "spread") {
        return `{...${attr.value}}`;
      }

      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function escapeAttributeValue(value: string, quote: string): string {
  return value.replace(new RegExp(quote, "g"), `\\${quote}`);
}

function needsNewline(node: Node): boolean {
  if (!node) return false;

  return (
    node.type === "element" ||
    node.type === "component" ||
    node.type === "custom-element" ||
    node.type === "comment" ||
    node.type === "frontmatter" ||
    node.type === "doctype"
  );
}

function isSelfClosing(tagName: string): boolean {
  const selfClosingTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ];

  return selfClosingTags.includes(tagName.toLowerCase());
}
