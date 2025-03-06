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

<button onclick={() => {score()}}>
    rescore
</button>

{#if $jobKeywords}
    <div class="w-full h-full grid grid-flow-row">
        <div class="">
            score: {$combinedScore}
        </div>
        <div class="grid grid-cols-2 w-full h-full">
            <ol>
                {#each $jobKeywords as jobKeyword}
                <!-- if keyword is in overlappingKeywords, color it green -->
                    <li class="" style="background-color: {$overlappingKeywords.includes(jobKeyword) ? 'green' : 'red'}">
                        {jobKeyword}
                    </li>
                {/each}
            </ol>
            <ol>
                {#each $resumeKeywords as resumeKeyword}
                    <li class="">
                        {resumeKeyword}
                    </li>
                {/each}
            </ol>
        </div>
    </div>
{:else}
    <div class="w-full h-full">
        Press the score button to generate a similarity score
    </div>
{/if}
