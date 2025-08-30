<script lang="ts">
    import { jobUrl, jobDescription } from "$utils";
    import Button from "$ui/Button.svelte";
    import GlassContainer from "$ui/GlassContainer.svelte";
    
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

<GlassContainer variant="container" fullWidth fullHeight>
    <GlassContainer variant="panel" fullWidth fullHeight class="p-4 flex flex-col">
        <!-- Header -->
        <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-blue animate-pulse"></div>
                    <h2 class="text-lg font-semibold text-text">Job Description Import</h2>
                </div>
                {#if $jobDescription}
                    <GlassContainer variant="badge">
                        {$jobDescription.length} characters
                    </GlassContainer>
                {/if}
            </div>
            
            <!-- URL Input Section -->
            <div class="flex gap-3">
                <div class="relative flex-1">
                    <GlassContainer variant="input" fullWidth class="relative">
                        <input
                            class="w-full bg-transparent border-none outline-none placeholder:text-subtext1"
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
                    </GlassContainer>
                </div>
                
                <Button
                    variant="style2"
                    size="medium"
                    onclick={fetchContent}
                    loading={isLoading}
                    loadingText="Fetching..."
                    disabled={!$jobUrl.trim()}
                    class="min-w-[90px] justify-center"
                >
                    {#snippet children()}
                        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <span>Import</span>
                    {/snippet}
                </Button>
            </div>
            
            {#if error}
                <GlassContainer variant="error" class="mt-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-red flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-red">{error}</span>
                </GlassContainer>
            {/if}
        </div>

        <!-- Content Area -->
        <div class="flex-1 min-h-0 relative">
            <GlassContainer variant="textarea" fullHeight class="relative">
                <textarea
                    class="w-full h-full resize-none bg-transparent border-none outline-none placeholder:text-subtext1"
                    bind:value={$jobDescription}
                    placeholder="Job description will appear here after import, or you can paste it manually..."
                    disabled={isLoading}
                ></textarea>
                
                {#if isLoading}
                    <GlassContainer variant="overlay" class="absolute inset-0 flex items-center justify-center">
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
                            <div class="text-subtext0 font-medium">Importing content...</div>
                        </div>
                    </GlassContainer>
                {/if}
            </GlassContainer>
        </div>
    </GlassContainer>
</GlassContainer>

