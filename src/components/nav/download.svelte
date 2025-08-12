<!--
DEPRECATED LEGACY COMPONENT: Download (PDF export trigger)
Replaced temporarily by a disabled placeholder in rewritten Topbar:
- New Topbar: [`Topbar.svelte`](src/components/layout/Topbar.svelte)
- Integrated shell: [`LayoutRoot.svelte`](src/components/layout/LayoutRoot.svelte)
- App integration: [`app.svelte`](src/components/app.svelte)

Status:
- Retained only until post-rewrite phase adds a new accessible download flow.
- DO NOT add new features here.
- Remove after tasks #15 & #16 complete (see a11y checklist: [`nav-a11y-checklist.md`](nav-a11y-checklist.md)).

Planned improvements for replacement implementation:
- Progress / generation feedback
- Error handling + retry
- Single responsibility utility for HTML to printable doc
- Avoid inline fetch of stylesheet (bundle or server-provided)
-->
<script>
    import { resumeHtml } from "$utils";
    let props = $props();
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

    async function downloadPdf() {
        // if $resumeHtml's promise is not resolved yet, don't download
        if ($resumeHtml && stylesheetContent !== "") {
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
                        <div class="pdf-page">${await $resumeHtml}</div>
                    </body>
                </html>
            `;

            const blob = new Blob([content], {
                type: "text/html;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);

            const newWindow = window.open(url, "_blank");
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
</script>

<button
    class="w-8 h-8 aspect-square rounded-lg bg-mantle hover:bg-sapphire transition-all duration-200 flex flex-row justify-center items-center group"
    onclick={downloadPdf}
    aria-label="Download PDF"
>
    
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z" class="fill-text group-hover:fill-mantle"/>
    </svg>
</button>
