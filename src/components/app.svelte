<script lang="ts">
    import LayoutRoot from "./layout/LayoutRoot.svelte";
    import ResumeEditor from "./resume/resumeeditor.svelte";
    import Pdfpreview from "./resume/pdfpreview.svelte";
    import Displayscores from "./resume/displayscores.svelte";
    import {
        jobUrl,
        jobDescription,
        keywords,
        header,
        createHeader,
        resumeHtml,
        projectEditingStage,
        resumeMd,
        resumeTemplate
    } from "$utils";
    import "./fonts.css";

    if ($keywords.length === 0) {
        fetch("/ResuMate/keywords.txt")
            .then((response) => response.text())
            .then((text) => {
                let textcleaned = text
                    .split("\n")
                    .map((skill) => skill.toLowerCase())
                    .filter((skill, index, self) => self.indexOf(skill) === index);
                textcleaned.sort((a, b) => b.length - a.length);
                $keywords = textcleaned;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    if ($header === "") {
        createHeader();
    }

    function fetchContent() {
        fetch("https://api.cors.lol/?url=" + $jobUrl)
            .then((response) => response.text())
            .then((text) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "text/html");
                const elementsToRemove = doc.querySelectorAll(
                    "script, style, header, footer, nav"
                );
                elementsToRemove.forEach((el) => el.remove());
                const textContent = doc.body.textContent || "";
                const cleanedText = textContent.replace(/\s+/g, " ").trim();
                text = cleanedText;
                $jobDescription = text;
            })
            .catch((err) => {
                console.log(err);
            });
    }
</script>

<LayoutRoot>
    <div class="grid grid-cols-[1fr_1fr] w-full h-full">
        <div class="w-full h-full overflow-clip">
            <ResumeEditor />
        </div>

        {#if $projectEditingStage === "Content"}
            <div class="w-full h-full bg-crust">
                <div class="w-full h-full bg-base p-2 rounded-xs flex flex-col">
                    <div class="w-full h-fit flex flex-row mb-2 gap-2">
                        <input
                            class="text-text px-2 py-1 w-full bg-mantle rounded"
                            bind:value={$jobUrl}
                            placeholder="try to fetch with a link"
                        />
                        <button
                            class="text-text px-2 py-1 ml-1 bg-mantle rounded hover:bg-overlay0 transition-all duration-200"
                            onclick={fetchContent}
                        >
                            fetch
                        </button>
                    </div>
                    <textarea
                        class="w-full flex-grow overflow-y-scroll bg-mantle p-2"
                        bind:value={$jobDescription}
                    ></textarea>
                </div>
            </div>
        {:else if $projectEditingStage === "Tuning"}
            <div class="h-full">
                <Displayscores />
            </div>
        {:else if $projectEditingStage === "Preview"}
            {#await $resumeHtml}
                <div>
                    <Pdfpreview html={"<h1>Loading...</h1>"} />
                </div>
            {:then content}
                <div>
                    <Pdfpreview html={content} />
                </div>
            {/await}
        {/if}
    </div>
</LayoutRoot>
