<script lang="ts">
    import * as monaco from "monaco-editor";
    import { onMount } from "svelte";
    import { appState } from "../lib/state.svelte";
    import { invoke } from "@tauri-apps/api/core";
    import {
        astroLanguageConfig,
        astroLanguageDefinition,
    } from "../lib/monarch";

    // Register the language with Monaco
    monaco.languages.register({ id: "astro", extensions: [".astro"] });
    monaco.languages.setMonarchTokensProvider("astro", astroLanguageDefinition);
    monaco.languages.setLanguageConfiguration("astro", astroLanguageConfig);

    let currentModel: monaco.editor.ITextModel | null = $state(null);
    let editor: monaco.editor.IStandaloneCodeEditor | null = $state(null);

    function handleKeydown(e: KeyboardEvent) {
        // Check if Ctrl (or Cmd on Mac) + S is pressed
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();

            if (!currentModel) return;

            invoke("save_file_content", {
                path: $appState.currentPath,
                content: currentModel.getValue(),
            });
        }
    }

    function handleResize() {
        editor?.layout();
    }

    onMount(() => {
        editor = monaco.editor.create(document.getElementById("monaco-root")!, {
            model: null,
            theme: "vs-dark",
            codeLens: false,
            lineNumbers: "off",
            minimap: { enabled: false },
        });

        $effect(() => {
            let newModel = monaco.editor.getModel(
                monaco.Uri.parse(`inmemory://${$appState.currentPath}`),
            );

            if (newModel) {
                currentModel = newModel;

                editor?.setModel(currentModel);
            } else {
                invoke("get_file_content", {
                    path: $appState.currentPath,
                }).then((content) => {
                    newModel = monaco.editor.createModel(
                        content as string,
                        "astro",
                        monaco.Uri.parse(`inmemory://${$appState.currentPath}`),
                    );

                    currentModel = newModel;

                    editor?.setModel(currentModel);
                });
            }
        });

        return () => {
            editor?.dispose();
        };
    });
</script>

<svelte:window onkeydown={handleKeydown} onresize={handleResize} />
<div id="monaco-root"></div>

<style>
    #monaco-root {
        height: 100%;
        width: 100%;
    }
</style>
