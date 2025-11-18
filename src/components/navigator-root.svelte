<script lang="ts">
    import { onMount } from "svelte";
    import { type FsNode } from "../lib/types";
    import NavigatorNode from "./navigator-node.svelte";
    import { watchImmediate } from "@tauri-apps/plugin-fs";
    import { invoke } from "@tauri-apps/api/core";
    import { appState } from "../lib/state.svelte";

    onMount(() => {
        // load initial tree then setup watcher
        invoke("get_content_tree", { path: $appState.activeProject! }).then(
            (tree) => {
                $appState.contentTree = tree as FsNode | null;
            },
        );

        watchImmediate(
            $appState.activeProject!,
            () => {
                invoke("get_content_tree").then((tree) => {
                    $appState.contentTree = tree as FsNode | null;
                });
            },
            {
                recursive: true,
            },
        ).then((unwatch) => {
            return unwatch;
        });
    });
</script>

<div>
    <button onclick={() => ($appState.activeProject = null)}>
        close project
    </button>
    {#if $appState.contentTree}
        {#each $appState.contentTree.children as child}
            <NavigatorNode tree={child} depth={0} />
        {/each}
    {/if}
</div>

<style>
    div {
        padding: 8px;
    }
</style>
