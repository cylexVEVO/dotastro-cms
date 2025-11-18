<script lang="ts">
    import type { TagLikeNode, Node } from "$lib/astro-compiler/shared/types";
    import { is } from "$lib/astro-compiler/browser/utils";
    import WriteBlock from "./write-block.svelte";

    const { node, depth }: { node: Node; depth: number } = $props();

    $inspect(node);
</script>

{#if is.tag(node)}
    <div
        style={`padding-left: ${depth === 0 ? "0" : "10"}px; border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px; display: flex; flex-direction: column; gap: 8px;`}
    >
        {node.name}
        <br />
        <div>
            {#each node.attributes as attr}
                <div>
                    {attr.name}: {attr.value}
                </div>
            {/each}
        </div>
        {#each node.children as child}
            <WriteBlock node={child} depth={depth + 1} />
        {/each}
    </div>
{/if}

{#if is.text(node)}
    {node.value}
{/if}

<style>
</style>
