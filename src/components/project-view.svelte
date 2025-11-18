<script lang="ts">
    import EditorMonaco from "./editor-monaco.svelte";
    import EditorWrite from "./editor-write.svelte";
    import Navigator from "./navigator-root.svelte";

    let mode: "monaco" | "write" = $state("write");
</script>

<div class="layout">
    <Navigator />
    <div class="editor-pane">
        <div class="mode-selector">
            <button onclick={() => (mode = "monaco")}>{"</>"}</button>
            <button onclick={() => (mode = "write")}>Aa</button>
        </div>
        {#if mode === "monaco"}
            <EditorMonaco />
        {:else if mode === "write"}
            <EditorWrite />
        {/if}
    </div>
</div>

<style>
    .editor-pane {
        display: grid;
        grid-template-rows: min-content auto;
    }

    .mode-selector {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

    .layout {
        width: 100vw;
        height: 100vh;
        display: grid;
        grid-template-columns: 1fr 3fr;
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
