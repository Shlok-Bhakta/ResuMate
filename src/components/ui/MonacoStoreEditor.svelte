<script lang="ts">
    import { onMount } from 'svelte';
    import * as monaco from 'monaco-editor';
    import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution';
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
        
        // Register custom markdown language with Monarch grammar
        monaco.languages.register({ id: 'customMarkdown' });
        
        monaco.languages.setMonarchTokensProvider('customMarkdown', {
            tokenizer: {
                root: [
                    // Headers
                    [/^#{6}\s+.*$/, 'markup.heading.6.markdown'],
                    [/^#{5}\s+.*$/, 'markup.heading.5.markdown'],
                    [/^#{4}\s+.*$/, 'markup.heading.4.markdown'],
                    [/^#{3}\s+.*$/, 'markup.heading.3.markdown'],
                    [/^#{2}\s+.*$/, 'markup.heading.2.markdown'],
                    [/^#{1}\s+.*$/, 'markup.heading.1.markdown'],
                    
                    // Bold and italic (combined)
                    [/\*\*\*([^*]+)\*\*\*/, 'markup.bold.italic.markdown'],
                    [/___([^_]+)___/, 'markup.bold.italic.markdown'],
                    
                    // Bold
                    [/\*\*([^*]+)\*\*/, 'markup.bold.markdown'],
                    [/__([^_]+)__/, 'markup.bold.markdown'],
                    
                    // Italic
                    [/\*([^*]+)\*/, 'markup.italic.markdown'],
                    [/_([^_]+)_/, 'markup.italic.markdown'],
                    
                    // Inline code
                    [/`([^`]+)`/, 'markup.raw.inline.markdown'],
                    
                    // Links
                    [/\[([^\]]+)\]\(([^)]+)\)/, 'markup.link.markdown'],
                    
                    // Lists
                    [/^\s*[-*+]\s+/, 'markup.list.markdown'],
                    [/^\s*\d+\.\s+/, 'markup.list.markdown'],
                    
                    // Blockquotes
                    [/^>\s+.*$/, 'markup.quote.markdown'],
                    
                    // Code blocks
                    [/^```.*$/, 'markup.raw.block.markdown'],
                    [/^    .*$/, 'markup.raw.block.markdown'],
                ]
            }
        });
        
        // Define Catppuccin Mocha theme
        monaco.editor.defineTheme('catppuccin-mocha', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: '', foreground: 'cdd6f4' }, // text
                { token: 'keyword', foreground: 'cba6f7' }, // mauve
                { token: 'operator', foreground: '89dceb' }, // sky
                { token: 'string', foreground: 'a6e3a1' }, // green
                { token: 'number', foreground: 'fab387' }, // peach
                { token: 'comment', foreground: '6c7086' }, // overlay0
                { token: 'type', foreground: 'f9e2af' }, // yellow
                { token: 'identifier', foreground: 'f2cdcd' }, // flamingo
                { token: 'delimiter', foreground: '94e2d5' }, // teal
                
                // Markdown specific tokens
                { token: 'markup.heading.1.markdown', foreground: 'f38ba8', fontStyle: 'bold' }, // h1 - red
                { token: 'markup.heading.2.markdown', foreground: 'fab387', fontStyle: 'bold' }, // h2 - peach
                { token: 'markup.heading.3.markdown', foreground: 'a6e3a1', fontStyle: 'bold' }, // h3 - green
                { token: 'markup.heading.4.markdown', foreground: '89dceb', fontStyle: 'bold' }, // h4 - sky
                { token: 'markup.heading.5.markdown', foreground: '89b4fa', fontStyle: 'bold' }, // h5 - blue
                { token: 'markup.heading.6.markdown', foreground: 'cba6f7', fontStyle: 'bold' }, // h6 - mauve
                
                { token: 'markup.bold.markdown', foreground: 'eba0ac', fontStyle: 'bold' }, // bold - maroon
                { token: 'markup.italic.markdown', foreground: 'eba0ac', fontStyle: 'italic' }, // italic - maroon
                { token: 'markup.bold.italic.markdown', foreground: 'eba0ac', fontStyle: 'bold italic' }, // bold italic - maroon
                
                { token: 'markup.quote.markdown', foreground: '7f849c' }, // blockquote - overlay1
                { token: 'markup.list.markdown', foreground: 'f5c2e7' }, // list markers - pink
                { token: 'markup.raw.inline.markdown', foreground: 'f9e2af' }, // inline code - yellow
                { token: 'markup.raw.block.markdown', foreground: 'f9e2af' }, // code blocks - yellow
                { token: 'markup.link.markdown', foreground: '89b4fa' }, // links - blue
                { token: 'markup.underline.link.markdown', foreground: '89b4fa' }, // link urls - blue
                
                // Generic fallbacks
                { token: 'tag', foreground: 'f38ba8' }, // pink
                { token: 'attribute.name', foreground: '89b4fa' }, // blue
                { token: 'attribute.value', foreground: 'a6e3a1' }, // green
            ],
            colors: {
                'editor.background': '#1e1e2e', // base
                'editor.foreground': '#cdd6f4', // text
                'editorLineNumber.foreground': '#6c7086', // overlay1
                'editorLineNumber.activeForeground': '#f5c2e7', // pink
                'editor.selectionBackground': '#45475a80', // surface1 with transparency
                'editor.selectionHighlightBackground': '#31324480', // surface0 with transparency
                'editorCursor.foreground': '#f5c2e7', // pink
                'editor.lineHighlightBackground': '#31324460', // surface0 with transparency
                'editorWhitespace.foreground': '#45475a', // surface1
                'editorIndentGuide.background': '#45475a', // surface1
                'editorIndentGuide.activeBackground': '#6c7086', // overlay1
                'editor.findMatchBackground': '#f9e2af80', // yellow with transparency
                'editor.findMatchHighlightBackground': '#fab38780', // peach with transparency
                'editorWidget.background': '#313244', // surface0
                'editorWidget.border': '#6c7086', // overlay1
                'input.background': '#313244', // surface0
                'input.foreground': '#cdd6f4', // text
                'input.border': '#6c7086', // overlay1
                'inputOption.activeBorder': '#89b4fa', // blue
                'scrollbar.shadow': '#00000080',
                'scrollbarSlider.background': '#45475a80', // surface1 with transparency
                'scrollbarSlider.hoverBackground': '#585b70a0', // surface2 with transparency
                'scrollbarSlider.activeBackground': '#6c7086a0', // overlay1 with transparency
            }
        });

        editor = monaco.editor.create(editorContainer, {
            value: initialValue || '',
            language: language === 'markdown' ? 'customMarkdown' : language,
            theme: 'catppuccin-mocha',
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
            fontFamily: "'CaskCovMono', 'JetBrains Mono', 'Fira Code', monospace",
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
        background: #1e1e2e; /* Catppuccin Mocha base */
        border: 1px solid #6c7086; /* Catppuccin Mocha overlay1 */
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(245, 194, 231, 0.1); /* pink accent */
    }
</style>