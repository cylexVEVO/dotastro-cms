import type { TagLikeNode } from "@astrojs/compiler/types";
import * as ts from "typescript";
import { initialize, parse } from "./astro-compiler/browser";
import { is, walkAsync } from "./astro-compiler/browser/utils";
import { invoke } from "@tauri-apps/api/core";
import type {
  ParseOptions,
  ParseResult,
  Position,
  RootNode,
  Node,
} from "./astro-compiler/shared/types";

function searchForSlot(node: TagLikeNode): boolean {
  if (node.name === "slot") return true;

  if (node.children.length > 0) {
    const childrenHaveSlots = node.children.map((node) =>
      is.tag(node) ? searchForSlot(node) : false,
    );

    return childrenHaveSlots.some(Boolean);
  }

  return false;
}

export async function parseAstro(
  src: string,
  options?: ParseOptions,
): Promise<ParseResult> {
  await initialize({ wasmURL: "/astro.wasm" });

  return parse(src, options);
}

export async function getComponentMetadata(src: string): Promise<{
  acceptsChildren: boolean;
  props: string[];
  importedComponents: string[];
}> {
  let hasSlot = false;
  let props: string[] = [];
  let components: string[] = [];

  const result = await parseAstro(src, { position: false });

  await walkAsync(result.ast, async (node) => {
    // search for slot, skip if already found
    if (is.tag(node) && !hasSlot) {
      hasSlot = searchForSlot(node);
    }

    if (is.frontmatter(node)) {
      const frontmatter = node.value.trim();
      const sourceFile = ts.createSourceFile(
        "frontmatter.ts",
        frontmatter,
        ts.ScriptTarget.Latest,
        true,
      );

      for (const statement of sourceFile.statements) {
        // very fragile component props extraction, only works
        // if props are destructured in the component
        if (ts.isVariableStatement(statement)) {
          const variableDeclarationList = statement.declarationList;

          for (const declaration of variableDeclarationList.declarations) {
            // only continue if we are destructing `Astro.props`
            if (declaration.getChildAt(2).getText() === "Astro.props") {
              const objectBindingPattern = declaration.getChildAt(0);

              if (ts.isObjectBindingPattern(objectBindingPattern)) {
                const elements = objectBindingPattern.elements;

                for (const element of elements) {
                  props.push(element.getText());
                }
              }
            }
          }
        }

        // also very fragile code to find imported components,
        // i will probably improve all of this at a
        // later date
        if (ts.isImportDeclaration(statement)) {
          // we only want to mark `[whatever].astro` as component imports
          if (!ts.isStringLiteral(statement.moduleSpecifier)) return;
          if (!statement.moduleSpecifier.text.endsWith(".astro")) return;

          if (statement.importClause?.name?.getText()) {
            components.push(statement.importClause?.name?.getText());
          }
        }
      }
    }
  });

  return {
    acceptsChildren: hasSlot,
    props,
    importedComponents: components,
  };
}

export async function getPackageName(pkgPath: string) {
  const packageJson = (await invoke("get_file_content", {
    path: `${pkgPath}/package.json`,
  })) as string;

  // if empty string (e.g. couldn't find file) just use path
  if (!packageJson) return pkgPath;

  return JSON.parse(packageJson).name ?? pkgPath;
}

export function traverseToBlock(
  ast: RootNode | TagLikeNode | null,
  position: Position | null,
): Node | null {
  if (!ast) return null;
  if (!position) return null;

  for (const child of ast.children) {
    if (child.position!.start.offset === position.start.offset) {
      return child;
    }

    if (is.tag(child)) {
      const block = traverseToBlock(child, position);

      if (block) return block;
    }
  }

  return null;
}
