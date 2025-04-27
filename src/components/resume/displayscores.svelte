<script lang="ts">
    import {
        combinedScore,
        jobKeywords,
        resumeKeywords,
        overlappingKeywords,
        score,
        resumeMd,
        jobDescription,
        keywords,
        tuneResume,
        tuning,

        openRouterAIModel

    } from "$utils";

    // start a ping on stores
    $combinedScore = $combinedScore;
    $jobKeywords = $jobKeywords;
    $resumeKeywords = $resumeKeywords;
    $overlappingKeywords = $overlappingKeywords;
</script>

{#if $jobKeywords}
    <div class="w-full h-full flex flex-col gap-2 p-4">
        <div class="w-full flex items-center justify-between mb-1">
            <div class="text-xs text-subtext0">
                    Match Score: {$combinedScore}%
                </div>
                <button
                    class="px-3 py-1 bg-mantle hover:bg-overlay0 transition-all duration-200 rounded text-xs"
                    onclick={() => {
                        score();
                    }}
                >
                    Rescore
                </button>
            </div>
            <div class="w-full flex flex-col gap-1">
                <div class="w-full h-2 bg-surface0 rounded overflow-hidden">
                    <div
                        class="h-full transition-all duration-500 rounded animate-gradient"
                        style="width: {$combinedScore}%; background: linear-gradient(90deg,
                            rgb(243, 139, 168) 0%,      /* red */
                            rgb(235, 160, 172) 5%,      /* maroon */
                            rgb(250, 179, 135) 10%,     /* peach */
                            rgb(249, 226, 175) 15%,     /* yellow */
                            rgb(166, 227, 161) 20%,     /* green */
                            rgb(148, 226, 213) 25%,     /* teal */
                            rgb(137, 220, 235) 30%,     /* blue */
                            rgb(116, 199, 236) 35%,     /* sapphire */
                            rgb(180, 190, 254) 40%,     /* lavender */
                            rgb(243, 139, 168) 45%      /* red */
                        ); background-size: 400% 100%;"
                    />
                </div>
                <div
                    class="w-full flex justify-between text-[10px] text-subtext1 px-0.5"
                >
                    <span>0%</span>
                    <span>100%</span>
                </div>
            </div>

            <div class="grid grid-cols-2 w-full gap-2 mt-2">
                <div class="flex flex-col min-h-0">
                    <div class="text-xs mb-1 font-medium text-subtext0">
                        Job Keywords
                    </div>
                    <div
                        class="flex flex-row flex-wrap content-start overflow-y-auto gap-1 scrollbar-thin scrollbar-thumb-overlay0 scrollbar-track-crust pr-1 h-[calc(100svh-15rem)]"
                    >
                        {#each $jobKeywords as jobKeyword}
                            <div
                                class="inline-flex px-2 py-0.5 text-xs rounded transition-all duration-200"
                                class:bg-green={$overlappingKeywords.includes(
                                    jobKeyword,
                                )}
                                class:bg-surface0={!$overlappingKeywords.includes(
                                    jobKeyword,
                                )}
                                class:text-base={$overlappingKeywords.includes(
                                    jobKeyword,
                                )}
                                class:text-text={!$overlappingKeywords.includes(
                                    jobKeyword,
                                )}
                            >
                                {jobKeyword}
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="flex flex-col min-h-0"> <!-- Removed h-full -->
                    <div class="text-xs mb-1 font-medium text-subtext0">
                        Resume Keywords
                    </div>
                    <div
                        class="flex flex-row flex-wrap content-start overflow-y-auto gap-1 scrollbar-thin scrollbar-thumb-overlay0 scrollbar-track-crust pr-1 h-[calc(100svh-15rem)]"
                    >
                        {#each $resumeKeywords as resumeKeyword}
                            <div
                                class="inline-flex px-2 py-0.5 text-xs rounded transition-all duration-200"
                                class:bg-green={$overlappingKeywords.includes(
                                    resumeKeyword,
                                )}
                                class:bg-surface0={!$overlappingKeywords.includes(
                                    resumeKeyword,
                                )}
                                class:text-base={$overlappingKeywords.includes(
                                    resumeKeyword,
                                )}
                                class:text-text={!$overlappingKeywords.includes(
                                    resumeKeyword,
                                )}
                            >
                                {resumeKeyword}
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

        <!-- AI tune button -->
        <button
            class="w-full bg-blue hover:bg-sapphire transition-all duration-200 px-4 py-2 rounded-md text-base flex items-center justify-center gap-2 mt-auto"
            onclick={tuneResume}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 36 36"
                ><!-- Icon from All by undefined - undefined --><path
                    fill="currentColor"
                    d="M33.18 26.11L20.35 13.28A9.28 9.28 0 0 0 7.54 2.79l-1.34.59l5.38 5.38l-2.82 2.83l-5.38-5.38l-.59 1.33a9.27 9.27 0 0 0 10.49 12.81l12.83 12.83a2 2 0 0 0 2.83 0l4.24-4.24a2 2 0 0 0 0-2.83m-5.66 5.66L13.88 18.12l-.57.16a7.27 7.27 0 0 1-9.31-7a7.2 7.2 0 0 1 .15-1.48l4.61 4.61l5.66-5.66l-4.61-4.6a7.27 7.27 0 0 1 8.47 9.16l-.16.57l13.65 13.65Z"
                    class="clr-i-outline clr-i-outline-path-1"
                /><circle
                    cx="27.13"
                    cy="27.09"
                    r="1.3"
                    fill="currentColor"
                    class="clr-i-outline clr-i-outline-path-2"
                    transform="rotate(-45 27.132 27.092)"
                /><path fill="none" d="M0 0h36v36H0z" /></svg
            >
            {#if $tuning}
            Calling LLM {$openRouterAIModel}...
            {:else}
            Tune Resume
            {/if}
        </button>
    </div>
{:else}
    <div class="w-full h-full text-subtext0">
        Press the score button to generate a similarity score
    </div>
{/if}

<style>
    @keyframes slide {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: -10% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    .animate-gradient {
        animation: slide 3s ease infinite;
    }
</style>
