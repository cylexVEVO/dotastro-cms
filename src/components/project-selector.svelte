<script lang="ts">
    import { getPackageName } from "$lib/parsing";
    import { appState } from "../lib/state.svelte";
    import { open } from "@tauri-apps/plugin-dialog";

    async function openProject() {
        const path = await open({
            directory: true,
        });

        if (!path) return;

        if (!$appState.projects.find((project) => project.path === path)) {
            $appState.projects.push({
                path,
                name: await getPackageName(path),
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
