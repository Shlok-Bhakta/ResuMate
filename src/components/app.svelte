<script lang="ts">
    import LayoutRoot from "./layout/LayoutRoot.svelte";
    import ResumeEditor from "./resume/resumeeditor.svelte";
    import Pdfpreview from "./resume/pdfpreview.svelte";
    import Displayscores from "./resume/displayscores.svelte";
    import JobFetcher from "./JobFetcher.svelte";
    import {
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
</script>

<LayoutRoot>
    <!-- Animated background blobs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
    </div>

    <div class="grid grid-cols-[1fr_1fr] w-full h-full relative">
        <div class="w-full h-full overflow-clip">
            <ResumeEditor />
        </div>

        {#if $projectEditingStage === "Content"}
            <JobFetcher />
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

<style>
    .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
        opacity: 0.12;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
    }

    .blob-1 {
        width: 300px;
        height: 300px;
        background: rgb(137, 180, 250); /* blue */
        top: 10%;
        left: 10%;
        animation: float1 12s infinite;
    }

    .blob-2 {
        width: 250px;
        height: 250px;
        background: rgb(180, 190, 254); /* lavender */
        top: 60%;
        right: 15%;
        animation: float2 15s infinite;
    }

    .blob-3 {
        width: 200px;
        height: 200px;
        background: rgb(116, 199, 236); /* sapphire */
        bottom: 20%;
        left: 50%;
        animation: float3 18s infinite;
    }

    @keyframes float1 {
        0% {
            transform: translate(0, 0) scale(1);
        }
        50% {
            transform: translate(50px, -30px) scale(1.1);
        }
        100% {
            transform: translate(-20px, 40px) scale(0.9);
        }
    }

    @keyframes float2 {
        0% {
            transform: translate(0, 0) scale(1);
        }
        50% {
            transform: translate(-40px, 50px) scale(0.8);
        }
        100% {
            transform: translate(30px, -25px) scale(1.2);
        }
    }

    @keyframes float3 {
        0% {
            transform: translate(0, 0) scale(1);
        }
        50% {
            transform: translate(-60px, -40px) scale(1.1);
        }
        100% {
            transform: translate(40px, 35px) scale(0.9);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .blob {
            animation: none;
        }
    }
</style>
