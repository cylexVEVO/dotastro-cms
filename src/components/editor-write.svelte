<script lang="ts">
    import { appState } from "../lib/state.svelte";
    import { invoke } from "@tauri-apps/api/core";
    import {
        getComponentMetadata,
        parseAstro,
        traverseToBlock,
    } from "$lib/parsing";
    import type {
        Node,
        Position,
        RootNode,
    } from "$lib/astro-compiler/shared/types";
    import { is } from "$lib/astro-compiler/browser/utils";
    import WriteBlock from "./write-block.svelte";
    import { astToString } from "$lib/serialize";

    let fileContent = $state("");
    let meta = $state({});
    let project = $derived(
        $appState.projects.find((p) => p.path === $appState.activeProject)!,
    );
    let ast: RootNode | null = $state(null);
    // position of the selected block
    let selectedBlockPosition: Position | null = $state(null);
    let selectedBlock: Node | null | undefined = $state(null);

    function handleKeydown(e: KeyboardEvent) {
        // Check if Ctrl (or Cmd on Mac) + S is pressed
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();

            if (ast) {
                invoke("save_file_content", {
                    path: $appState.currentPath,
                    content: astToString(ast),
                });
            }
        }
    }

    $effect(() => {
        invoke("get_file_content", {
            path: $appState.currentPath,
        }).then((content) => {
            fileContent = content as string;
            parseAstro(fileContent, { position: true }).then((result) => {
                ast = result.ast;
            });
        });
    });

    $effect(() => {
        getComponentMetadata(fileContent).then((metadata) => {
            meta = metadata;
        });
    });

    $effect(() => {
        selectedBlock = traverseToBlock(ast, selectedBlockPosition);
    });
</script>

<svelte:window onkeydown={handleKeydown} />
<div id="monaco-root">
    <div>
        {#each ast?.children as child, i}
            <WriteBlock
                bind:node={ast!.children[i]}
                depth={0}
                bind:selectedBlock={selectedBlockPosition}
            />
        {/each}
    </div>
    <div>
        {#if selectedBlock}
            {#if is.tag(selectedBlock)}
                {#each selectedBlock.attributes as attr, i}
                    <div>
                        {attr.name}: {attr.value}
                    </div>
                {/each}
            {/if}
        {/if}
    </div>
</div>

<style>
    #monaco-root {
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns: 3fr 1fr;
    }
</style>
