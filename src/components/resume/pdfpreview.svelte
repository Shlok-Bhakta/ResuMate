<script lang="ts">
    import { calculateOptimalSpacing } from "$lib/components/utils/measurementSpacing.ts";
    
    let props = $props();
    let container: HTMLElement;
    let iframe: HTMLIFrameElement;
    let scale = $state(1);
    let stylesheetContent = $state("");
    let adaptiveCSS = $state("");
    let isOptimizing = $state(false);

    // Fetch CSS content when component initializes
    async function loadStylesheet() {
        try {
            const response = await fetch("/ResuMate/style.css");
            if (response.ok) {
                stylesheetContent = await response.text();
            } else {
                console.error("Failed to load stylesheet");
            }
        } catch (error) {
            console.error("Error loading stylesheet:", error);
        }
    }

    // Load stylesheet immediately
    loadStylesheet();

    // Calculate optimal spacing for the current content
    async function optimizeSpacing(htmlContent: string, baseCSS: string) {
        if (!htmlContent || htmlContent === "<h1>Loading...</h1>") {
            return "";
        }

        isOptimizing = true;
        try {
            const result = await calculateOptimalSpacing(htmlContent, baseCSS);
            console.log(`Optimal spacing found: ${result.multiplier.toFixed(3)}x (estimated height: ${result.estimatedHeight}px)`);
            return result.css;
        } catch (error) {
            console.error("Error optimizing spacing:", error);
            return "";
        } finally {
            isOptimizing = false;
        }
    }

    // Function to handle responsive scaling
    function handleResize(_: any) {
        if (container && iframe) {
            const paperWidthPx = 8.5 * 96;  // 8.5 inches in pixels
            const paperHeightPx = 11 * 96;  // 11 inches in pixels
            const containerHeight = window.innerHeight * 0.9;  // Use 90% of viewport for breathing room
            
            // Calculate scale based on available height to fit perfectly
            const heightScale = containerHeight / paperHeightPx;
            scale = Math.min(heightScale, 0.95); // Scale down a bit more for padding
            
            // Apply the transform scale with left-top origin
            iframe.style.transform = `scale(${scale})`;
            iframe.style.transformOrigin = 'left top';
            
            // Calculate the actual space needed for the scaled preview
            const scaledWidth = paperWidthPx * scale;
            const scaledHeight = paperHeightPx * scale;
            
            // Set container to exact size needed
            container.style.width = `${scaledWidth}px`;
            container.style.height = `${scaledHeight}px`;
            
            // Set parent container width to just what's needed + padding
            // This will free up space for the editor
            const parentContainer = container.parentElement;
            if (parentContainer) {
                parentContainer.style.width = `${scaledWidth + 32}px`; // 32px for padding
            }
        }
    }


    // Load content into the iframe when html and CSS are ready
    $effect(() => {
        async function renderWithOptimalSpacing() {
            if (!iframe || !props.html || stylesheetContent === "") {
                return;
            }

            // First render with base CSS to calculate optimal spacing
            const baseCSS = stylesheetContent;
            adaptiveCSS = await optimizeSpacing(props.html, baseCSS);

            const iframeDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) return;

            iframeDoc.open();

            // Create the HTML structure with the embedded CSS and adaptive spacing
            const content = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>
                            ${stylesheetContent}
                            
                            body, html {
                                margin: 0;
                                padding: 0;
                                height: 100%;
                            }
                            .pdf-page {
                                width: 8.5in;
                                height: 11in;
                                background-color: white;
                                padding-left: 0.2in;
                                padding-right: 0.2in;
                                padding-bottom: 0.1in;
                                box-sizing: border-box;
                                overflow: hidden;
                            }
                            
                            /* Adaptive spacing overrides */
                            ${adaptiveCSS}
                        </style>
                    </head>
                    <body>
                        <div class="pdf-page">${props.html}</div>
                    </body>
                </html>
            `;

            iframeDoc.write(content);
            iframeDoc.close();
            
            // Trigger resize calculation after content is loaded
            handleResize(null);
        }

        renderWithOptimalSpacing();
    });
</script>

<svelte:window on:resize={handleResize} />
<div class="w-full h-full bg-crust flex items-start justify-start p-4">
    <div class="relative overflow-hidden w-fit" bind:this={container} use:handleResize>
        {#if isOptimizing}
            <div class="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10 rounded-lg">
                <div class="bg-surface0 text-text px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                    <div class="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-sm font-medium">Optimizing spacing...</span>
                </div>
            </div>
        {/if}
        
        <iframe
            bind:this={iframe}
            title="Resume Preview"
            class="w-[8.5in] h-[11in] border-none origin-top"
            sandbox="allow-same-origin allow-scripts allow-downloads allow-popups allow-forms allow-modals"
        ></iframe>
        
    </div>
</div>

<style>

</style>
