import type { TagLikeNode } from "@astrojs/compiler/types";
import * as ts from "typescript";
import { initialize, parse } from "./astro-compiler/browser";
import { is, walkAsync } from "./astro-compiler/browser/utils";

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

export async function getComponentMetadata(
  src: string,
): Promise<{ acceptsChildren: boolean; props: string[] }> {
  let hasSlot = false;
  let props: string[] = [];

  await initialize({ wasmURL: "/astro.wasm" });

  const result = await parse(src, { position: false });

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

      // very fragile component props extraction, only works
      // if props are destructured in the component
      for (const variableStatement of sourceFile.statements) {
        if (ts.isVariableStatement(variableStatement)) {
          const variableDeclarationList = variableStatement.declarationList;

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
      }
    }
  });

  return {
    acceptsChildren: hasSlot,
    props,
  };
}
