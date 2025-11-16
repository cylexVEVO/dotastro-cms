<script lang="ts">
    import { type FsNode } from "../types";
    import { appState } from "../state.svelte";
    import NavigatorNode from "./navigator-node.svelte";

    const { tree, depth }: { tree: FsNode; depth: number } = $props();
    let expanded = $state(true);

    function handleClick() {
        if (tree.is_file) {
            appState.currentPath = tree.path;
        }
    }
</script>

{#if tree.is_file}
    <button
        style={`padding-left: ${depth !== 0 ? 20 : 0}px; background: transparent; border: none; color: inherit; font: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px; max-width: max-content; text-align: left;`}
        onclick={handleClick}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            style="width: 14px; height: 14px;"
        >
            <path
                fill-rule="evenodd"
                d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 5.75A.75.75 0 0 1 5.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 7.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"
                clip-rule="evenodd"
            />
            />
        </svg>

        {tree.name}
    </button>
{:else}
    <button
        style={`padding-left: ${depth !== 0 ? 20 : 0}px; background: transparent; border: none; color: inherit; font: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px; max-width: max-content; text-align: left;`}
        onclick={() => (expanded = !expanded)}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            style="width: 14px; height: 14px;"
        >
            <path
                d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM2 9.5v3A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 12.5 8h-9A1.5 1.5 0 0 0 2 9.5Z"
            />
        </svg>

        {tree.name}
    </button>
    {#if expanded}
        <div style={`padding-left: ${depth !== 0 ? 20 : 0}px;`}>
            {#each tree.children as child}
                <NavigatorNode tree={child} depth={depth + 1} />
            {/each}
        </div>
    {/if}
{/if}

<style>
</style>
