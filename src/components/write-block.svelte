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
    import { textTags, type AddBlockMode } from "$lib/types";

    let {
        node = $bindable(),
        depth,
        selectedBlock = $bindable(),
        deleteSelf,
        addBlock,
        importComponent,
        isChildOfDefaultEditable,
    }: {
        node: Node;
        depth: number;
        selectedBlock: Position | null | undefined;
        deleteSelf: () => void;
        addBlock: (
            mode: AddBlockMode,
            component: string,
            self: Position,
        ) => void;
        importComponent: (name: string) => void;
        isChildOfDefaultEditable: boolean;
    } = $props();

    let project = $derived(
        $appState.projects.find((p) => p.path === $appState.activeProject)!,
    );
    let defaultEditable = (() => {
        if (!is.tag(node)) return false;
        const self = project.components.find(
            (c) => c.componentName === node.name,
        );
        if (!self) return false;
        return (
            self.acceptsChildren ||
            textTags.includes(node.name) ||
            isChildOfDefaultEditable
        );
    })();

    let addMode: AddBlockMode = $state("above");

    let dialog: HTMLDialogElement;

    function selectSelf() {
        selectedBlock = node.position;
    }

    function showAddModal(insertPosition: AddBlockMode) {
        addMode = insertPosition;
        dialog.showModal();
    }

    function int_addBlock(
        mode: AddBlockMode,
        component: string,
        self: Position,
    ) {
        if (!parent) return;
        if (!is.tag(node)) return;

        let done = false;

        if (mode === "inside") {
            node.children.map((child, i) => {
                if (
                    child.position!.start.offset === self.start.offset &&
                    !done
                ) {
                    if (!is.tag(child)) return;

                    if (component === "#TextNode") {
                        child.children.push({
                            type: "text",
                            value: "",
                        });
                    } else {
                        importComponent(component);
                        child.children.push({
                            type: "component",
                            attributes: [],
                            children: [],
                            name: component,
                        });
                    }

                    done = true;

                    return;

                    // if (ast) {
                    //     invoke("save_file_content", {
                    //         path: $appState.currentPath,
                    //         content: astToString(ast),
                    //     });
                    // }
                }
            });

            return;
        }

        node.children.map((child, i) => {
            if (child.position!.start.offset === self.start.offset && !done) {
                const insertIdx = mode === "above" ? i : i + 1;
                if (component === "#TextNode") {
                    node.children.splice(insertIdx, 0, {
                        type: "text",
                        value: "",
                    });
                } else {
                    importComponent(component);
                    node.children.splice(insertIdx, 0, {
                        type: "component",
                        attributes: [],
                        children: [],
                        name: component,
                    });
                }

                done = true;

                return;

                // if (ast) {
                //     invoke("save_file_content", {
                //         path: $appState.currentPath,
                //         content: astToString(ast),
                //     });
                // }
            }
        });
    }
</script>

<dialog bind:this={dialog} closedby="any">
    <form
        method="dialog"
        style="display: flex; width: 100%; justify-content: end;"
    >
        <button class="button">x</button>
    </form>

    <div style="display: flex; flex-direction: column; gap: 8px;">
        {#each project.components as component}
            <button
                class="button"
                onclick={() =>
                    addBlock(addMode, component.componentName, node.position!)}
            >
                {component.componentName}
            </button>
        {/each}
        <button
            class="button"
            onclick={() => addBlock(addMode, "#TextNode", node.position!)}
        >
            #TextNode
        </button>
    </div>
</dialog>

{#if is.tag(node)}
    <div
        style={`padding-left: ${depth === 0 ? "0" : "10"}px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 16px 8px 8px 8px; display: flex; flex-direction: column; gap: 8px; background: ${depth % 2 === 0 ? "#282824" : "rgba(0, 0, 0, 0.2)"}`}
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
            <button class="button" onclick={() => showAddModal("above")}
                >↑+</button
            >
            <button class="button" onclick={() => showAddModal("below")}
                >↓+</button
            ><button class="button" onclick={() => showAddModal("inside")}
                >→+</button
            >
        </div>
        {#each node.children as child, i}
            <WriteBlock
                bind:node={node.children[i]}
                depth={depth + 1}
                bind:selectedBlock
                deleteSelf={() =>
                    (node.children = node.children.filter((c, j) => i !== j))}
                {importComponent}
                addBlock={int_addBlock}
                isChildOfDefaultEditable={project.components.find(
                    (c) => c.componentName === node.name,
                )?.acceptsChildren ?? false}
            />
        {/each}
    </div>
{/if}

{#if is.text(node)}
    {#if defaultEditable || node.value.trim() || isChildOfDefaultEditable}
        <div
            style={`padding-left: ${depth === 0 ? "0" : "10"}px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 16px 8px 8px 8px; display: flex; flex-direction: column; gap: 8px; background: ${depth % 2 === 0 ? "#282824" : "rgba(0, 0, 0, 0.2)"}`}
        >
            <div class="block-heading">
                <button
                    style="background: unset; color: inherit; font: inherit;
                    text-align: inherit; border: none; flex-grow: 1;"
                >
                    #TextNode
                    <!-- {#if node.attributes.length}
                        <span style="opacity: .5; font-size: .8rem;"
                            >{node.attributes.length}
                            {node.attributes.length > 1 ? "attrs" : "attr"}</span
                        >
                    {/if} -->
                </button>
                <button class="button" onclick={() => deleteSelf()}>x</button>
                <button class="button" onclick={() => showAddModal("above")}
                    >↑+</button
                >
                <button class="button" onclick={() => showAddModal("below")}
                    >↓+</button
                >
                <!-- <button class="button" onclick={() => showAddModal("inside")}
                    >→+</button
                > -->
            </div>
            <textarea
                style="background: none; border: rgba(255, 255, 255, 0.1) 1px solid; color: inherit; font: inherit; padding: 8px; resize: vertical;"
                bind:value={node.value}
            ></textarea>
        </div>
    {/if}
{/if}

<style>
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.7);
    }

    dialog {
        background: #282824;
        color: inherit;
        border: none;
        width: 50vw;
    }

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
