<script lang="ts">
    import { getComponentMetadata, getPackageName } from "$lib/parsing";
    import { invoke } from "@tauri-apps/api/core";
    import { appState } from "../lib/state.svelte";
    import { open } from "@tauri-apps/plugin-dialog";
    import type { FsNode } from "$lib/types";

    function getComponentPaths(tree: FsNode) {
        const src = tree.children.find(
            (node) => node.name === "src" && !node.is_file,
        );

        if (!src) return [];

        const components = src.children.find(
            (node) => node.name === "components" && !node.is_file,
        );

        if (!components) return [];

        return components.children
            .filter((node) => node.is_file && node.name.endsWith(".astro"))
            .map((node) => node.path);
    }

    async function openProject() {
        const path = await open({
            directory: true,
        });

        if (!path) return;

        if (!$appState.projects.find((project) => project.path === path)) {
            const tree = (await invoke("get_content_tree", {
                path,
            })) as FsNode | null;
            if (!tree) return;

            const componentPaths = getComponentPaths(tree);
            const componentsSrc = await Promise.all(
                componentPaths.map(async (path) => {
                    const src = (await invoke("get_file_content", {
                        path,
                    })) as string;

                    return {
                        src,
                        path,
                    };
                }),
            );
            const components = await Promise.all(
                componentsSrc.map(async (component) => {
                    const meta = await getComponentMetadata(component.src);

                    return {
                        ...meta,
                        absolutePath: component.path,
                    };
                }),
            );

            $appState.projects.push({
                path,
                name: await getPackageName(path),
                components,
            });
        }

        $appState.activeProject = path;
    }
</script>

<div class="layout">
    <h1>Projects</h1>
    <div class="list">
        <button onclick={openProject}>Open...</button>
        {#each $appState.projects as project}
            <div>
                <button onclick={() => ($appState.activeProject = project.path)}
                    >{project.name}</button
                >
                <button
                    onclick={() => {
                        appState.update((state) => ({
                            ...state,
                            projects: state.projects.filter(
                                (p) => p.path !== project.path,
                            ),
                        }));
                    }}>x</button
                >
            </div>
        {/each}
    </div>
</div>

<style>
    .layout {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    button {
        padding: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.1);
        color: inherit;
        cursor: pointer;
        font-size: 0.8rem;
    }
</style>
