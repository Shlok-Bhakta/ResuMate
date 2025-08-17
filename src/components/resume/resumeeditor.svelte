<script lang="ts">
    import "./editor.css";
    import { Carta, MarkdownEditor} from "carta-md";
    import { resumeMd, resumeHtml, score, jobDescription, keywords, saveCurrentProject, header, editorShortcuts, tableify, saveState} from "$utils";
    let carta = new Carta({
            sanitizer: false,
            theme: "catppuccin-mocha",

            // extensions: [
            //     editorShortcuts
            // ]
    });
    
    let scoreTimeout: ReturnType<typeof setTimeout> | null = null;
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;
    let renderTimeout: ReturnType<typeof setTimeout> | null = null;
    let isSaving = false;
    
    function updateSaveState() {
        $saveState = 0; // Pending state
    }

    // Handle HTML rendering and autosave
    $effect(() => {
        $resumeMd;
        $header;
        $jobDescription;
        
        // Skip updates if we're currently saving to prevent double-updates
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
        
        // Debounce the expensive carta.render() call
        renderTimeout = setTimeout(() => {
            // TEMPORARY: Test without tableify to isolate performance issue
            $resumeHtml = carta.render($header + $resumeMd);
            // $resumeHtml = carta.render($header + tableify($resumeMd));
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
   
</script>
<div class="w-full h-full glass-editor-container">    
    <MarkdownEditor 
        {carta} 
        bind:value={$resumeMd}
        mode="tabs" 
        theme="main"
		disableToolbar={true} 
    />
</div>
<style>
	.glass-editor-container {
		background: linear-gradient(145deg, 
			rgba(30, 30, 46, 0.05) 0%, 
			rgba(137, 180, 250, 0.02) 50%, 
			rgba(30, 30, 46, 0.05) 100%
		);
		border-radius: 8px;
		padding: 1rem;
	}

	:global(.carta-font-code) {
		font-family: 'CaskCovMono', 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.95rem;
		line-height: 1.4;
		letter-spacing: -0.02em;
	}

	:global(.carta-editor) {
		background: rgba(30, 30, 46, 0.3) !important;
		border: 1px solid rgba(137, 180, 250, 0.15) !important;
		border-radius: 8px !important;
		box-shadow: 
			0 4px 16px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(137, 180, 250, 0.1) !important;
	}

	:global(.carta-input) {
		background: transparent !important;
		color: rgb(205, 214, 244) !important;
		padding: 1rem !important;
	}

	:global(.carta-input::placeholder) {
		color: rgba(186, 194, 222, 0.6) !important;
	}

	:global(.carta-input:focus) {
		border-color: rgba(137, 180, 250, 0.3) !important;
		box-shadow: 
			0 4px 16px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(137, 180, 250, 0.1),
			0 0 0 3px rgba(137, 180, 250, 0.1) !important;
	}

	:global(.carta-tabs) {
		background: rgba(30, 30, 46, 0.2) !important;
		border-bottom: 1px solid rgba(137, 180, 250, 0.15) !important;
		border-radius: 8px 8px 0 0 !important;
	}

	:global(.carta-tab) {
		background: transparent !important;
		border: none !important;
		color: rgba(186, 194, 222, 0.8) !important;
		transition: all 0.2s ease !important;
	}

	:global(.carta-tab:hover) {
		background: rgba(137, 180, 250, 0.1) !important;
		color: rgb(205, 214, 244) !important;
	}

	:global(.carta-tab.active) {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.4) 0%, 
			rgba(116, 199, 236, 0.5) 100%
		) !important;
		color: rgb(30, 30, 46) !important;
		font-weight: 600 !important;
	}

</style>
