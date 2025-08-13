<script>
    let props = $props();
    let container;
    let iframe;
    let scale = $state(1);
    let stylesheetContent = $state("");


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

    // Function to handle responsive scaling
    function handleResize() {
        if (container && iframe) {
            const paperWidthPx = 8.5 * 96;  // 8.5 inches in pixels
            const paperHeightPx = 11 * 96;  // 11 inches in pixels
            const containerHeight = window.innerHeight * 0.95;  // Use 95% of viewport
            const containerWidth = container.clientWidth;  // Remove padding reduction
            
            // Calculate scales for both dimensions
            const heightScale = containerHeight / paperHeightPx;
            const widthScale = containerWidth / paperWidthPx;
            
            // Use the smaller scale to maintain aspect ratio while maximizing space
            scale = Math.min(heightScale, widthScale) * 1; // Add a small margin
            
            // Apply the transform scale with centered origin
            iframe.style.transform = `scale(${scale})`;
            iframe.style.transformOrigin = 'center top';
            
            // Update container height to match scaled content with some padding
            const scaledHeight = paperHeightPx * scale;
            container.style.height = `${scaledHeight + 20}px`; // Add padding
        }
    }


    // Load content into the iframe when html and CSS are ready
    $effect(() => {
        if (iframe && props.html && stylesheetContent !== "") {
            const iframeDoc =
                iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();

            // Create the HTML structure with the embedded CSS
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
                                padding-top: 0.0in;
                                padding-left: 0.2in;
                                padding-right: 0.2in;
                                box-sizing: border-box;
                                overflow: hidden;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="pdf-page">${props.html}</div>
                    </body>
                </html>
            `;

            iframeDoc.write(content);
            iframeDoc.close();
        }
    });
</script>

<svelte:window on:resize={handleResize} />
<div class="p-1 bg-crust flex flex-col items-center">
    <div class="relative overflow-hidden w-full" bind:this={container} use:handleResize>
        <iframe
            bind:this={iframe}
            title="Resume Preview"
            class="w-[8.5in] h-[11in] border-none origin-top mx-auto"
            sandbox="allow-same-origin allow-scripts allow-downloads allow-popups allow-forms allow-modals"
        ></iframe>
        
    </div>
</div>

<style>

</style>
