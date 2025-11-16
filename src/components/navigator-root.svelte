<script lang="ts">
    import { onMount } from "svelte";
    import { type FsNode } from "../types";
    import NavigatorNode from "./navigator-node.svelte";
    import { watchImmediate } from "@tauri-apps/plugin-fs";
    import { invoke } from "@tauri-apps/api/core";
    import { appState as state } from "../state.svelte";

    onMount(() => {
        // load initial tree then setup watcher
        invoke("get_content_tree").then((tree) => {
            state.contentTree = tree as FsNode | null;
        });

        watchImmediate(
            "/Users/cylex/Documents/cylex.dog/src/pages",
            () => {
                invoke("get_content_tree").then((tree) => {
                    state.contentTree = tree as FsNode | null;
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
    {#if state.contentTree}
        {#each state.contentTree.children as child}
            <NavigatorNode tree={child} depth={0} />
        {/each}
    {/if}
</div>

<style>
    div {
        padding: 8px;
    }
</style>
