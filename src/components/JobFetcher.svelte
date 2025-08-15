<script lang="ts">
    import { jobUrl, jobDescription } from "$utils";
    
    let isLoading = false;
    let error = null;

    async function fetchContent() {
        if (!$jobUrl.trim()) return;
        
        isLoading = true;
        error = null;
        
        try {
            const response = await fetch("https://api.cors.lol/?url=" + $jobUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const elementsToRemove = doc.querySelectorAll(
                "script, style, header, footer, nav"
            );
            elementsToRemove.forEach((el) => el.remove());
            const textContent = doc.body.textContent || "";
            const cleanedText = textContent.replace(/\s+/g, " ").trim();
            $jobDescription = cleanedText;
        } catch (err) {
            console.error("Failed to fetch job description:", err);
            error = "Failed to fetch content. Check the URL and try again.";
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="w-full h-full glass-container">
    <div class="w-full h-full glass-panel p-4 flex flex-col">
        <!-- Header -->
        <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-blue animate-pulse"></div>
                    <h2 class="text-lg font-semibold text-text">Job Description Import</h2>
                </div>
                {#if $jobDescription}
                    <div class="glass-badge">
                        {$jobDescription.length} characters
                    </div>
                {/if}
            </div>
            
            <!-- URL Input Section -->
            <div class="flex gap-3">
                <div class="relative flex-1">
                    <input
                        class="w-full px-3 py-2 glass-input focus:glass-input-focus transition-all duration-300 placeholder:text-subtext1"
                        bind:value={$jobUrl}
                        placeholder="Paste job posting URL here..."
                        disabled={isLoading}
                    />
                    {#if $jobUrl && !isLoading}
                        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-green">
                            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    {/if}
                </div>
                
                <button
                    class="glass-button px-4 py-2 font-medium flex items-center gap-2 min-w-[90px] justify-center"
                    onclick={fetchContent}
                    disabled={isLoading || !$jobUrl.trim()}
                >
                    {#if isLoading}
                        <div class="w-4 h-4 border-2 border-base border-t-transparent rounded-full animate-spin"></div>
                        <span>Fetching...</span>
                    {:else}
                        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <span>Import</span>
                    {/if}
                </button>
            </div>
            
            {#if error}
                <div class="mt-3 p-3 glass-error flex items-center gap-2">
                    <svg class="w-4 h-4 text-red flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-red">{error}</span>
                </div>
            {/if}
        </div>

        <!-- Content Area -->
        <div class="flex-1 min-h-0 relative">
            <div class="h-full relative glass-textarea-container">
                <textarea
                    class="w-full h-full resize-none glass-textarea focus:glass-textarea-focus transition-all duration-300 placeholder:text-subtext1"
                    bind:value={$jobDescription}
                    placeholder="Job description will appear here after import, or you can paste it manually..."
                    disabled={isLoading}
                ></textarea>
                
                {#if isLoading}
                    <div class="absolute inset-0 glass-overlay flex items-center justify-center">
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
                            <div class="text-subtext0 font-medium">Importing content...</div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .glass-container {
        background: linear-gradient(135deg, 
            rgba(137, 180, 250, 0.02) 0%, 
            rgba(116, 199, 236, 0.015) 25%, 
            rgba(166, 227, 161, 0.01) 50%, 
            rgba(250, 179, 135, 0.015) 75%, 
            rgba(243, 139, 168, 0.02) 100%
        );
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        border: 1px solid rgba(137, 180, 250, 0.15);
        border-radius: 0.75rem;
    }

    .glass-panel {
        background: rgba(30, 30, 46, 0.15);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        border: 1px solid rgba(137, 180, 250, 0.08);
        border-radius: 0.75rem;
        margin: 0.25rem;
    }

    .glass-input {
        background: rgba(30, 30, 46, 0.1);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        border: 1px solid rgba(137, 180, 250, 0.08);
        border-radius: 0.5rem;
        color: rgb(205, 214, 244);
        font-size: 0.875rem;
        line-height: 1.6;
    }

    .glass-input-focus {
        border-color: rgba(137, 180, 250, 0.3);
        box-shadow: inset 0 0 0 1px rgba(137, 180, 250, 0.3);
        background: rgba(30, 30, 46, 0.2);
    }

    .glass-button {
        background: linear-gradient(135deg, 
            rgba(137, 180, 250, 0.8) 0%, 
            rgba(116, 199, 236, 0.9) 100%
        );
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(137, 180, 250, 0.3);
        border-radius: 0.5rem;
        color: rgb(17, 17, 27);
        font-weight: 600;
        box-shadow: 
            0 4px 12px rgba(137, 180, 250, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: all 0.15s ease-out;
    }

    .glass-button:hover:not(:disabled) {
        background: linear-gradient(135deg, 
            rgba(137, 180, 250, 0.9) 0%, 
            rgba(116, 199, 236, 1) 100%
        );
        box-shadow: 
            0 6px 20px rgba(137, 180, 250, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
        transition: none;
    }

    .glass-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .glass-textarea-container {
        background: rgba(30, 30, 46, 0.1);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        border: 1px solid rgba(137, 180, 250, 0.08);
        border-radius: 0.75rem;
        overflow: hidden;
    }

    .glass-textarea {
        background: transparent;
        border: none;
        outline: none;
        padding: 0.75rem;
        color: rgb(205, 214, 244);
        font-size: 0.875rem;
        line-height: 1.6;
        resize: none;
    }

    .glass-textarea-focus {
        box-shadow: inset 0 0 0 1px rgba(137, 180, 250, 0.3);
    }

    .glass-textarea::-webkit-scrollbar {
        width: 8px;
    }

    .glass-textarea::-webkit-scrollbar-track {
        background: transparent;
    }

    .glass-textarea::-webkit-scrollbar-thumb {
        background: rgba(137, 180, 250, 0.3);
        border-radius: 4px;
        border: 1px solid rgba(137, 180, 250, 0.1);
    }

    .glass-textarea::-webkit-scrollbar-thumb:hover {
        background: rgba(137, 180, 250, 0.5);
    }

    .glass-badge {
        background: rgba(49, 50, 68, 0.8);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        border: 1px solid rgba(137, 180, 250, 0.2);
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        color: rgb(166, 173, 200);
    }

    .glass-error {
        background: rgba(243, 139, 168, 0.1);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        border: 1px solid rgba(243, 139, 168, 0.3);
        border-radius: 0.5rem;
    }

    .glass-overlay {
        background: rgba(30, 30, 46, 0.8);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        border-radius: 0.75rem;
    }
</style>