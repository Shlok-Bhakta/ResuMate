<script lang="ts">
    import { onMount } from 'svelte';
    import * as monaco from 'monaco-editor';
    import MarkdownIt from 'markdown-it/dist/index.cjs.js';
    import { resumeMd, resumeHtml, score, jobDescription, keywords, saveCurrentProject, header, tableify, saveState } from "$utils";
    import { processFlexboxMarkers } from "$lib/components/utils/formatting.ts";
    let editorContainer: HTMLDivElement;
    let editor: monaco.editor.IStandaloneCodeEditor;
    
    // Initialize markdown-it
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

    // FULL EFFECTS - Test if markdown-it + Monaco + effects slow down
    $effect(() => {
        $resumeMd;
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
            const processedMarkdown = tableify($resumeMd);
            const fullContent = $header + processedMarkdown;
            const renderedHtml = md.render(fullContent);
            $resumeHtml = processFlexboxMarkers(renderedHtml);
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
        // Initialize Monaco editor
        editor = monaco.editor.create(editorContainer, {
            value: $resumeMd,
            language: 'markdown',
            theme: 'vs-dark',
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
        editor.onDidChangeModelContent(() => {
            const value = editor.getValue();
            resumeMd.set(value);
        });

        // Update editor when store changes (from external sources)
        const unsubscribe = resumeMd.subscribe((value) => {
            if (editor && editor.getValue() !== value) {
                editor.setValue(value);
            }
        });

        return () => {
            unsubscribe();
            editor?.dispose();
        };
    });
</script>

<div class="w-full h-full monaco-container">
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