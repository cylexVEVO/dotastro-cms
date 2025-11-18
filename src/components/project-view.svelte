<script lang="ts">
    import Editor from "./editor.svelte";
    import Navigator from "./navigator-root.svelte";
</script>

<div>
    <Navigator />
    <Editor />
</div>

<style>
    div {
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
