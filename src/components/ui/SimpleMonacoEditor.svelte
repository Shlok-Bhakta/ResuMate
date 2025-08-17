<script lang="ts">
    import { onMount } from 'svelte';
    import * as monaco from 'monaco-editor';

    let editorContainer: HTMLDivElement;
    let editor: monaco.editor.IStandaloneCodeEditor;
    
    // Props
    let { 
        value = $bindable(''), 
        language = 'markdown', 
        theme = 'vs-dark', 
        height = '300px' 
    } = $props();

    // Update editor when value prop changes (external updates like fetch)
    $effect(() => {
        if (editor) {
            const currentValue = editor.getValue();
            if (currentValue !== value) {
                console.log('Monaco editor updating from:', currentValue.length, 'to:', value.length);
                const position = editor.getPosition();
                editor.setValue(value || '');
                if (position) {
                    editor.setPosition(position);
                }
            }
        }
    });

    onMount(() => {
        // Initialize Monaco editor
        editor = monaco.editor.create(editorContainer, {
            value: value,
            language: language,
            theme: theme,
            automaticLayout: true,
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            folding: false,
            renderWhitespace: 'none',
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
        });

        // Update prop when editor content changes
        editor.onDidChangeModelContent(() => {
            value = editor.getValue();
        });

        return () => {
            editor?.dispose();
        };
    });
</script>

<div class="monaco-container" style="height: {height}">
    <div bind:this={editorContainer} class="w-full h-full"></div>
</div>

<style>
    .monaco-container {
        background: rgba(30, 30, 46, 0.3);
        border: 1px solid rgba(137, 180, 250, 0.15);
        border-radius: 8px;
        overflow: hidden;
    }
</style>