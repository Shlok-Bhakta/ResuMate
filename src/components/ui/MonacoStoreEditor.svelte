<script lang="ts">
    import { onMount } from 'svelte';
    import * as monaco from 'monaco-editor';
    import MarkdownIt from 'markdown-it';
    import type { Writable } from 'svelte/store';
    import { resumeHtml, score, jobDescription, header, tableify, saveState, saveCurrentProject } from "$utils";

    let editorContainer: HTMLDivElement;
    let editor: monaco.editor.IStandaloneCodeEditor;
    
    // Props - accept a Svelte store directly
    let { 
        store,
        language = 'markdown', 
        theme = 'vs-dark', 
        height = '300px',
        enableEffects = false,
        onContentChange = undefined
    }: {
        store: Writable<string>;
        language?: string;
        theme?: string;
        height?: string;
        enableEffects?: boolean;
        onContentChange?: ((value: string) => void) | undefined;
    } = $props();

    // Track if we're updating from store to prevent loops
    let isUpdatingFromStore = false;

    // Effects for main resume editor
    const md = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true
    });

    let scoreTimeout: ReturnType<typeof setTimeout> | null = null;
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;
    let renderTimeout: ReturnType<typeof setTimeout> | null = null;
    let isSaving = false;
    
    function updateSaveState() {
        $saveState = 0; // Pending state
    }

    // Effect to sync store changes to editor
    $effect(() => {
        const storeValue = $store;
        if (editor && !isUpdatingFromStore) {
            const currentValue = editor.getValue();
            if (currentValue !== storeValue) {
                console.log('Monaco updating from store, length:', storeValue.length);
                const position = editor.getPosition();
                const selection = editor.getSelection();
                
                isUpdatingFromStore = true;
                editor.setValue(storeValue || '');
                
                // Restore cursor position and selection
                if (position) {
                    editor.setPosition(position);
                }
                if (selection) {
                    editor.setSelection(selection);
                }
                isUpdatingFromStore = false;
            }
        }
    });

    // Resume effects (only when enableEffects is true)
    $effect(() => {
        if (!enableEffects) return;
        
        $store;
        $header;
        $jobDescription;
        
        if (isSaving) return;
        
        updateSaveState();
        
        // Clear all timeouts
        if (renderTimeout !== null) {
            clearTimeout(renderTimeout);
        }
        if (scoreTimeout !== null) {
            clearTimeout(scoreTimeout);
        }
        if (saveTimeout !== null) {
            clearTimeout(saveTimeout);
        }
        
        // Debounce markdown rendering with markdown-it
        renderTimeout = setTimeout(() => {
            const storeValue = $store;
            const processedMarkdown = tableify(storeValue);
            const fullContent = $header + processedMarkdown;
            $resumeHtml = md.render(fullContent);
        }, 200);
        
        // Debounce scoring
        scoreTimeout = setTimeout(() => {   
            score();
        }, 600);
        
        // Debounce saving
        saveTimeout = setTimeout(async () => {
            isSaving = true;
            await saveCurrentProject();
            isSaving = false;
        }, 1200);
    });

    onMount(() => {
        // Initialize Monaco editor with current store value
        const initialValue = $store;
        
        editor = monaco.editor.create(editorContainer, {
            value: initialValue || '',
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

        // Update store when editor content changes
        const contentChangeDisposable = editor.onDidChangeModelContent(() => {
            if (!isUpdatingFromStore) {
                const value = editor.getValue();
                store.set(value);
                
                // Call optional callback
                if (onContentChange) {
                    onContentChange(value);
                }
            }
        });

        return () => {
            contentChangeDisposable?.dispose();
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