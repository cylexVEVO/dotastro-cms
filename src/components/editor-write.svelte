<script lang="ts">
    import * as monaco from "monaco-editor";
    import { onMount } from "svelte";
    import { appState } from "../lib/state.svelte";
    import { invoke } from "@tauri-apps/api/core";
    import { getComponentMetadata, parseAstro } from "$lib/parsing";
    import type { RootNode } from "$lib/astro-compiler/shared/types";
    import { is } from "$lib/astro-compiler/browser/utils";
    import WriteBlock from "./write-block.svelte";

    let fileContent = $state("");
    let meta = $state({});
    let project = $derived(
        $appState.projects.find((p) => p.path === $appState.activeProject)!,
    );
    let ast: RootNode | null = $state(null);

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
</script>

<div id="monaco-root">
    {#each ast?.children as child}
        <WriteBlock node={child} depth={0} />
    {/each}
</div>

<style>
    #monaco-root {
        height: 100%;
        width: 100%;
    }
</style>
