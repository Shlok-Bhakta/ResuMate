<script>
    let props = $props();
    
    let container;
    let iframe;
    let scale = $state(1);
    let stylesheetContent = $state('');
    
    // Fetch CSS content when component initializes
    async function loadStylesheet() {
        try {
            const response = await fetch('/ResuMate/style.css');
            if (response.ok) {
                stylesheetContent = await response.text();
            } else {
                console.error('Failed to load stylesheet');
            }
        } catch (error) {
            console.error('Error loading stylesheet:', error);
        }
    }
    
    // Load stylesheet immediately
    loadStylesheet();
    
    // Function to handle responsive scaling
    function handleResize() {
        if (container && iframe) {
            const availableWidth = container.clientWidth - 40;
            const paperWidthPx = 8.5 * 96; // 8.5 inches in pixels (96 DPI)
            scale = Math.min(1, availableWidth / paperWidthPx);
            
            iframe.style.transform = `scale(${scale})`;
            iframe.style.transformOrigin = 'top center';
            container.style.height = `${11 * 96 * scale + 40}px`;
        }
    }
    
    // Load content into the iframe when html and CSS are ready
    $effect(() => {
        if (iframe && props.html && stylesheetContent !== '') {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
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

<svelte:window on:resize={handleResize}/>

<div class="pdf-container" bind:this={container} use:handleResize>
    <iframe 
        bind:this={iframe}
        title="Resume Preview" 
        class="pdf-iframe"
        sandbox="allow-same-origin"
    ></iframe>
</div>

<style>
    /* Styles remain unchanged */
    .pdf-container {
        padding: 20px;
        display: flex;
        justify-content: center;
        /* background-color: #f0f0f0; */
        min-height: 300px;
    }
    
    .pdf-iframe {
        width: 8.5in;
        height: 11in;
        border: none;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }
</style>
