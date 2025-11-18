<script lang="ts">
    import type {
        TagLikeNode,
        Node,
        Position,
    } from "$lib/astro-compiler/shared/types";
    import { is } from "$lib/astro-compiler/browser/utils";
    import WriteBlock from "./write-block.svelte";

    let {
        node = $bindable(),
        depth,
        selectedBlock = $bindable(),
    }: {
        node: Node;
        depth: number;
        selectedBlock: Position | null | undefined;
    } = $props();

    function selectSelf() {
        selectedBlock = node.position;
    }
</script>

{#if is.tag(node)}
    <div
        style={`padding-left: ${depth === 0 ? "0" : "10"}px; border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px; display: flex; flex-direction: column; gap: 8px;`}
    >
        <button
            onclick={selectSelf}
            style="background: unset; color: inherit; font: inherit; text-align: inherit; border: none"
        >
            {node.name}
            {#if node.attributes.length}
                <span style="opacity: .5; font-size: .8rem;"
                    >{node.attributes.length}
                    {node.attributes.length > 1 ? "attrs" : "attr"}</span
                >
            {/if}
        </button>
        {#each node.children as child, i}
            <WriteBlock
                bind:node={node.children[i]}
                depth={depth + 1}
                bind:selectedBlock
            />
        {/each}
    </div>
{/if}

{#if is.text(node)}
    <input bind:value={node.value} />
{/if}

<style>
</style>
