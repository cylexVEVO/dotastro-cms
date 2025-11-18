<script lang="ts">
    import ProjectView from "../components/project-view.svelte";
    import ProjectSelector from "../components/project-selector.svelte";

    import { appState } from "../state.svelte";
</script>

<main>
    {#if $appState.activeProject}
        <ProjectView />
    {:else}
        <ProjectSelector />
    {/if}
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }

    :root {
        background: #282824;
        color: #f4f1d7;
        margin: 0;
        padding: 0;
        font-family: sans-serif;
    }

    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>
