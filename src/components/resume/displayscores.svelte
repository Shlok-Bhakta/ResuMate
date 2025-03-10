<script lang="ts">
    import {
        combinedScore,
        jobKeywords,
        resumeKeywords,
        overlappingKeywords,
        score,
        resumeMd,
        jobDescription,
        keywords
    } from "$utils";

    // start a ping on stores
    $combinedScore = $combinedScore;
    $jobKeywords = $jobKeywords;
    $resumeKeywords = $resumeKeywords;
    $overlappingKeywords = $overlappingKeywords;
</script>

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

{#if $jobKeywords}
    <div class="w-full flex flex-col gap-2">
        <div class="w-full flex items-center justify-between mb-1">
            <div class="text-xs text-subtext0">Match Score: {$combinedScore}%</div>
            <button class="px-3 py-1 bg-mantle hover:bg-overlay0 transition-all duration-200 rounded text-xs" onclick={() => {score()}}>
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
            <div class="w-full flex justify-between text-[10px] text-subtext1 px-0.5">
                <span>0%</span>
                <span>100%</span>
            </div>
        </div>
        
        <div class="grid grid-cols-2 w-full gap-2 mt-2">
            <div class="flex flex-col">
                <div class="text-xs mb-1 font-medium text-subtext0">Job Keywords</div>
                <div class="flex flex-row flex-wrap content-start overflow-y-auto gap-1 max-h-[40vh] scrollbar-thin scrollbar-thumb-overlay0 scrollbar-track-crust pr-1">
                    {#each $jobKeywords as jobKeyword}
                        <div
                            class="inline-flex px-2 py-0.5 text-xs rounded transition-all duration-200"
                            class:bg-green={$overlappingKeywords.includes(jobKeyword)}
                            class:bg-surface0={!$overlappingKeywords.includes(jobKeyword)}
                            class:text-base={$overlappingKeywords.includes(jobKeyword)}
                            class:text-text={!$overlappingKeywords.includes(jobKeyword)}
                        >
                            {jobKeyword}
                        </div>
                    {/each}
                </div>
            </div>
            
            <div class="flex flex-col">
                <div class="text-xs mb-1 font-medium text-subtext0">Resume Keywords</div>
                <div class="flex flex-row flex-wrap content-start overflow-y-auto gap-1 max-h-[40vh] scrollbar-thin scrollbar-thumb-overlay0 scrollbar-track-crust pr-1">
                    {#each $resumeKeywords as resumeKeyword}
                        <div
                            class="inline-flex px-2 py-0.5 text-xs rounded transition-all duration-200"
                            class:bg-green={$overlappingKeywords.includes(resumeKeyword)}
                            class:bg-surface0={!$overlappingKeywords.includes(resumeKeyword)}
                            class:text-base={$overlappingKeywords.includes(resumeKeyword)}
                            
                            class:text-text={!$overlappingKeywords.includes(resumeKeyword)}
                        >
                            {resumeKeyword}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{:else}
    <div class="w-full h-full text-subtext0">
        Press the score button to generate a similarity score
    </div>
{/if}
