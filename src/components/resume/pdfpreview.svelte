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
            scale = Math.min(heightScale, widthScale) * 0.95; // Add a small margin
            
            // Apply the transform scale with centered origin
            iframe.style.transform = `scale(${scale})`;
            iframe.style.transformOrigin = 'center top';
            
            // Update container height to match scaled content with some padding
            const scaledHeight = paperHeightPx * scale;
            container.style.height = `${scaledHeight + 20}px`; // Add padding
        }
    }

    function downloadPdf() {
        if (iframe && props.html && stylesheetContent !== "") {
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
                            max-height: 11in;
                        @page {
                            size: letter;
                            scale: 1;
                            margin: 0;
                            width: 8.5in;
                            height: 11in;
                        }
                        
                        .pdf-page {
                            overflow: hidden;
                            max-height: 11in;
                        }

                        }

                        </style>
                    </head>
                    <body>
                        <div class="pdf-page">${props.html}</div>
                    </body>
                </html>
            `;

            const blob = new Blob([content], { type: "text/html;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            
            const newWindow = window.open(url, '_blank');
            if (newWindow) {
                newWindow.onload = () => {
                    newWindow.document.title = "ResuMate";
                    setTimeout(() => {
                        newWindow.focus();
                        newWindow.print();
                        // Clean up after printing
                        setTimeout(() => {
                            newWindow.close();
                            URL.revokeObjectURL(url);
                        }, 100);
                    }, 100);
                };
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
<div class="p-1 bg-crust flex flex-col items-center">
    <div class="relative overflow-hidden w-full" bind:this={container} use:handleResize>
        <iframe
            bind:this={iframe}
            title="Resume Preview"
            class="w-[8.5in] h-[11in] border-none origin-top mx-auto"
            sandbox="allow-same-origin allow-scripts allow-downloads allow-popups allow-forms allow-modals"
        ></iframe>
        <button
            class="absolute top-2 right-2 w-8 h-8 rounded-lg bg-mantle hover:bg-surface1 transition-colors flex items-center justify-center cursor-pointer"
            onclick={downloadPdf}
        >
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3C!-- Icon from All by undefined - undefined --%3E%3Cpath fill='%237f849c' d='m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z'/%3E%3C/svg%3E"
                 alt="Download"
                 class="w-5 h-5"
            />
        </button>
    </div>
</div>

<style>
    button {
        z-index: 10;
    }
</style>
