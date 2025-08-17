<script lang="ts">
    import LayoutRoot from "./layout/LayoutRoot.svelte";
    import MonacoStoreEditor from "./ui/MonacoStoreEditor.svelte";
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
  import WelcomeModal from "./WelcomeModal.svelte";

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
    {#snippet children()}
        <!-- Animated background blobs -->
        <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="blob blob-3"></div>
        </div>

        <div class="flex w-full h-full relative gap-1">
            <div class="flex-1 min-w-0 h-full overflow-hidden glass-panel">
                <MonacoStoreEditor 
                    store={resumeMd}
                    enableEffects={true}
                    height="100%"
                />
            </div>

            {#if $projectEditingStage === "Content"}
                <div class="flex-1 min-w-0 h-full overflow-hidden glass-panel">
                    <JobFetcher />
                </div>
            {:else if $projectEditingStage === "Tuning"}
                <div class="flex-1 min-w-0 h-full overflow-hidden glass-panel">
                    <Displayscores />
                </div>
            {:else if $projectEditingStage === "Preview"}
                {#await $resumeHtml}
                    <div class="w-fit flex-shrink-0 h-full overflow-hidden glass-panel">
                        <Pdfpreview html={"<h1>Loading...</h1>"} />
                    </div>
                {:then content}
                    <div class="w-fit flex-shrink-0 h-full overflow-hidden glass-panel">
                        <Pdfpreview html={content} />
                    </div>
                {/await}
            {/if}
        </div>
    {/snippet}
</LayoutRoot>

<WelcomeModal />

<style>
    .glass-panel {
        background: linear-gradient(145deg, 
            rgba(137, 180, 250, 0.03) 0%, 
            rgba(30, 30, 46, 0.02) 25%, 
            rgba(116, 199, 236, 0.02) 50%, 
            rgba(30, 30, 46, 0.03) 75%, 
            rgba(166, 227, 161, 0.02) 100%
        );
        border: 1px solid rgba(137, 180, 250, 0.08);
        border-radius: 12px;
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(137, 180, 250, 0.1);
    }

    .blob {
        position: absolute;
        border-radius: 50%;
        opacity: 0.08;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        pointer-events: none;
    }

    .blob-1 {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(137, 180, 250, 0.6) 0%, rgba(116, 199, 236, 0.4) 50%, transparent 70%);
        top: 5%;
        left: 5%;
        animation: float1 16s infinite;
    }

    .blob-2 {
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, rgba(116, 199, 236, 0.5) 0%, rgba(94, 196, 188, 0.4) 50%, transparent 70%);
        top: 55%;
        right: 10%;
        animation: float2 20s infinite;
    }

    .blob-3 {
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(94, 196, 188, 0.4) 0%, rgba(116, 199, 236, 0.3) 50%, transparent 70%);
        bottom: 15%;
        left: 45%;
        animation: float3 24s infinite;
    }

    @keyframes float1 {
        0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
        }
        33% {
            transform: translate(60px, -40px) scale(1.1) rotate(120deg);
        }
        66% {
            transform: translate(-30px, 50px) scale(0.9) rotate(240deg);
        }
        100% {
            transform: translate(0, 0) scale(1) rotate(360deg);
        }
    }

    @keyframes float2 {
        0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
        }
        33% {
            transform: translate(-50px, 60px) scale(0.8) rotate(-120deg);
        }
        66% {
            transform: translate(40px, -35px) scale(1.2) rotate(-240deg);
        }
        100% {
            transform: translate(0, 0) scale(1) rotate(-360deg);
        }
    }

    @keyframes float3 {
        0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
        }
        33% {
            transform: translate(-70px, -50px) scale(1.1) rotate(90deg);
        }
        66% {
            transform: translate(50px, 40px) scale(0.9) rotate(180deg);
        }
        100% {
            transform: translate(0, 0) scale(1) rotate(270deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .blob {
            animation: none;
        }
    }
</style>
