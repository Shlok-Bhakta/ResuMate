<script lang="ts">
    import "./editor.css";
    import { Carta, MarkdownEditor} from "carta-md";
    import { resumeMd, resumeHtml, score, jobDescription, keywords, saveCurrentProject, header, editorShortcuts, tableify, saveState, streamingContent, isStreaming} from "$utils";
    let carta = new Carta({
            sanitizer: false,
            theme: "catppuccin-mocha",

            extensions: [
                editorShortcuts
            ]
    });
    $inspect(carta);
    
    let scoreTimeout: ReturnType<typeof setTimeout> | null = null;
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;
    let rerenderTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // Computed value for editor content - shows streaming or regular content
    let displayedContent: string = $state('');
    
    function updateSaveState() {
        $saveState = 0; // Pending state
    }

    // Update displayed content based on streaming state
    $effect(() => {
        if ($isStreaming && $streamingContent) {
            displayedContent = $streamingContent;
        } else {
            displayedContent = $resumeMd;
        }
    });
    
    // Handle changes to the editor during streaming
    function handleEditorChange(newValue: string) {
        if (!$isStreaming) {
            $resumeMd = newValue;
        }
    }

    // Handle HTML rendering and autosave
    $effect(() => {
        $jobDescription
        $resumeHtml = carta.render($header + tableify(displayedContent));
        
        // Only update save state and trigger autosave if not streaming
        if (!$isStreaming) {
            updateSaveState();
            // this stops the expensive score function from running every time the editor updates
            // it only runs when the user is idle for 3 seconds
            if (scoreTimeout !== null) {
                clearTimeout(scoreTimeout);
            }
            if (saveTimeout !== null) {
                clearTimeout(saveTimeout);
            }
            if (rerenderTimeout !== null) {
                clearTimeout(rerenderTimeout);
            }
            scoreTimeout = setTimeout(() => {   
                score();
            }, 500);
            saveTimeout = setTimeout(() => {
                saveCurrentProject();
            }, 1000);
            rerenderTimeout = setTimeout(() => {
                $resumeHtml = carta.render($header + tableify($resumeMd));
            }, 1000);
        }
    });
   
</script>
<div class="w-full h-full glass-editor-container" class:streaming={$isStreaming}>    
    <MarkdownEditor 
        {carta} 
        value={displayedContent}
        on:change={(e) => handleEditorChange(e.detail)}
        mode="tabs" 
        theme="main" 
        readonly={$isStreaming}
    />
    {#if $isStreaming}
        <div class="streaming-overlay">
            <div class="streaming-indicator">
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <span>AI is generating content...</span>
            </div>
        </div>
    {/if}
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

	/* Streaming effects */
	.glass-editor-container.streaming {
		animation: streamingGlow 2s ease-in-out infinite;
	}

	@keyframes streamingGlow {
		0%, 100% { 
			background: linear-gradient(145deg, 
				rgba(30, 30, 46, 0.05) 0%, 
				rgba(137, 180, 250, 0.02) 50%, 
				rgba(30, 30, 46, 0.05) 100%
			);
		}
		50% { 
			background: linear-gradient(145deg, 
				rgba(30, 30, 46, 0.08) 0%, 
				rgba(137, 180, 250, 0.06) 50%, 
				rgba(30, 30, 46, 0.08) 100%
			);
		}
	}

	.streaming-overlay {
		position: absolute;
		top: 0;
		right: 0;
		padding: 1rem;
		pointer-events: none;
		z-index: 10;
	}

	.streaming-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(137, 180, 250, 0.15);
		border: 1px solid rgba(137, 180, 250, 0.3);
		border-radius: 20px;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		color: rgb(137, 180, 250);
		backdrop-filter: blur(4px);
	}

	.typing-dots {
		display: flex;
		gap: 0.2rem;
	}

	.dot {
		width: 4px;
		height: 4px;
		background: rgb(137, 180, 250);
		border-radius: 50%;
		animation: typingBounce 1.4s ease-in-out infinite;
	}

	.dot:nth-child(1) { animation-delay: 0s; }
	.dot:nth-child(2) { animation-delay: 0.2s; }
	.dot:nth-child(3) { animation-delay: 0.4s; }

	@keyframes typingBounce {
		0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
		40% { transform: scale(1.2); opacity: 1; }
	}

	/* Make editor readonly styling more obvious during streaming */
	.streaming :global(.carta-input) {
		background: rgba(30, 30, 46, 0.1) !important;
		cursor: not-allowed !important;
	}
</style>
