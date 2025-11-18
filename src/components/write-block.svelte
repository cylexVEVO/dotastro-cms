<script lang="ts">
    import type {
        TagLikeNode,
        Node,
        Position,
        RootNode,
    } from "$lib/astro-compiler/shared/types";
    import { is } from "$lib/astro-compiler/browser/utils";
    import WriteBlock from "./write-block.svelte";
    import { appState } from "$lib/state.svelte";
    import { textTags } from "$lib/types";

    let {
        node = $bindable(),
        depth,
        selectedBlock = $bindable(),
        deleteSelf,
    }: {
        node: Node;
        depth: number;
        selectedBlock: Position | null | undefined;
        deleteSelf: () => void;
    } = $props();

    let project = $derived(
        $appState.projects.find((p) => p.path === $appState.activeProject)!,
    );
    let defaultEditable = (() => {
        if (!is.tag(node)) return false;
        const self = project.components.find((c) =>
            c.absolutePath.endsWith(`${node.name}.astro`),
        );
        if (!self) return false;
        return self.acceptsChildren || textTags.includes(node.name);
    })();

    function selectSelf() {
        selectedBlock = node.position;
    }
</script>

{#if is.tag(node)}
    <div
        style={`padding-left: ${depth === 0 ? "0" : "10"}px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 16px 8px 16px 8px; display: flex; flex-direction: column; gap: 8px; background: ${depth % 2 === 0 ? "#282824" : "rgba(0, 0, 0, 0.2)"}`}
    >
        <div class="block-heading">
            <button
                onclick={selectSelf}
                style="background: unset; color: inherit; font: inherit; text-align: inherit; border: none; flex-grow: 1;"
            >
                {node.name}
                {#if node.attributes.length}
                    <span style="opacity: .5; font-size: .8rem;"
                        >{node.attributes.length}
                        {node.attributes.length > 1 ? "attrs" : "attr"}</span
                    >
                {/if}
            </button>
            <button class="button" onclick={() => deleteSelf()}>x</button>
        </div>
        {#each node.children as child, i}
            <WriteBlock
                bind:node={node.children[i]}
                depth={depth + 1}
                bind:selectedBlock
                deleteSelf={() =>
                    (node.children = node.children.filter((c, j) => i !== j))}
            />
        {/each}
    </div>
{/if}

{#if is.text(node)}
    {#if defaultEditable || node.value.trim()}
        <textarea
            style="background: none; border: rgba(255, 255, 255, 0.1) 1px solid; color: inherit; font: inherit; padding: 8px; resize: vertical;"
            bind:value={node.value}
        ></textarea>
    {/if}
{/if}

<style>
    .button {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.1);
        color: inherit;
        cursor: pointer;
        font-size: 0.8rem;
        display: inline;
    }

    .block-heading {
        display: flex;
        align-items: center;
    }
</style>
