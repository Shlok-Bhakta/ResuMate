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
            const containerHeight = window.innerHeight * 0.8;  // Use 80% of viewport
            const containerWidth = container.clientWidth - 20;  // Account for padding
            
            // First check if height is constrained
            if (paperHeightPx > containerHeight) {
                // Scale by height and calculate width using aspect ratio
                scale = containerHeight / paperHeightPx;
            } else if (paperWidthPx > containerWidth) {
                // If width needs to be constrained, scale by width
                scale = containerWidth / paperWidthPx;
            } else {
                // No scaling needed
                scale = 1;
            }
            
            // Apply the transform scale
            iframe.style.transform = `scale(${scale})`;
            iframe.style.transformOrigin = 'top center';
            
            // Update container height to match scaled content
            const scaledHeight = paperHeightPx * scale;
            container.style.height = `${scaledHeight}px`;
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

            let newwindow = window.open();
            newwindow.write(content);
            newwindow.focus();
            // set new window title so maybe it can be the pdf name as its saved
            newwindow.document.title = "ResuMate";
            // wait for like 2 seconds
            newwindow.print();
            newwindow.close();
            setTimeout(() => {
            }, 2000);
            // newwindow.print();
            
            // newwindow.close();
            // const blob = new Blob([content], { type: "application/pdf" });
            // const url = URL.createObjectURL(blob);
            // console.log(url);
            // const a = document.createElement("a");
            // a.href = url;
            // a.download = "resume.pdf";
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            // URL.revokeObjectURL(url);
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
<div class="p-2 bg-crust flex flex-col items-center">
    <div class="relative overflow-hidden" bind:this={container} use:handleResize>
        <iframe
            bind:this={iframe}
            title="Resume Preview"
            class="w-[8.5in] h-[11in] border-none origin-top"
            sandbox="allow-same-origin allow-scripts allow-downloads allow-popups allow-forms allow-modals"
        ></iframe>
    </div>
    <button class="print-button" onclick={downloadPdf}> Download Resume </button>
</div>

<style>
    /* Styles remain unchanged */
</style>
