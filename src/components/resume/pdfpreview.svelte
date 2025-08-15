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
            
            // Calculate scale based on available height to fit perfectly
            const heightScale = containerHeight / paperHeightPx;
            scale = Math.min(heightScale, 1); // Don't scale larger than 100%
            
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
<div class="w-full h-full bg-crust flex items-start justify-start p-4">
    <div class="relative overflow-hidden w-fit" bind:this={container} use:handleResize>
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
