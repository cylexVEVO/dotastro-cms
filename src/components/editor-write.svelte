<script lang="ts">
    import * as monaco from "monaco-editor";
    import { onMount } from "svelte";
    import { appState } from "../lib/state.svelte";
    import { invoke } from "@tauri-apps/api/core";
    import { getComponentMetadata } from "$lib/parsing";

    let fileContent = $state("");
    let meta = $state({});

    $effect(() => {
        invoke("get_file_content", {
            path: $appState.currentPath,
        }).then((content) => {
            fileContent = content as string;
        });
    });

    $effect(() => {
        getComponentMetadata(fileContent).then((metadata) => {
            console.log(fileContent, metadata);
            meta = metadata;
        });
    });
</script>

<div id="monaco-root">{JSON.stringify(meta)}</div>

<style>
    #monaco-root {
        height: 100%;
        width: 100%;
    }
</style>
