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
        openRouterAIModel,
        streamingContent,
        isStreaming
    } from "$utils";

    let isRescoring = false;

    function getScoreColor(score: number) {
        if (score >= 80) return 'bg-gradient-to-r from-green to-teal';
        if (score >= 60) return 'bg-gradient-to-r from-yellow to-peach';
        if (score >= 40) return 'bg-gradient-to-r from-peach to-maroon';
        return 'bg-gradient-to-r from-red to-maroon';
    }

    function getScoreCircleStyle(score: number) {
        if (score >= 80) {
            return `background: linear-gradient(135deg, 
                rgba(166, 227, 161, 0.8) 0%, 
                rgba(148, 226, 213, 0.9) 100%
            ); border-color: rgba(148, 226, 213, 0.6);`;
        }
        if (score >= 60) {
            return `background: linear-gradient(135deg, 
                rgba(249, 226, 175, 0.8) 0%, 
                rgba(250, 179, 135, 0.9) 100%
            ); border-color: rgba(250, 179, 135, 0.6);`;
        }
        if (score >= 40) {
            return `background: linear-gradient(135deg, 
                rgba(250, 179, 135, 0.8) 0%, 
                rgba(235, 160, 172, 0.9) 100%
            ); border-color: rgba(235, 160, 172, 0.6);`;
        }
        return `background: linear-gradient(135deg, 
            rgba(243, 139, 168, 0.8) 0%, 
            rgba(235, 160, 172, 0.9) 100%
        ); border-color: rgba(243, 139, 168, 0.6);`;
    }

    function getScoreText(score: number) {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        if (score >= 40) return 'Fair Match';
        return 'Needs Work';
    }

    async function handleRescore() {
        isRescoring = true;
        try {
            await score();
        } finally {
            isRescoring = false;
        }
    }
</script>

{#if $jobKeywords}
    <div class="w-full h-full glass-container">
        <div class="w-full h-full glass-panel p-4 flex flex-col">
            <!-- Score Header -->
            <div class="mb-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="score-circle" style={getScoreCircleStyle(Math.round($combinedScore))}>
                            <span class="text-lg font-bold text-base">{Math.round($combinedScore)}%</span>
                        </div>
                        <div>
                            <h2 class="text-lg font-semibold text-text">Resume Match Score</h2>
                            <p class="text-sm text-subtext0">{getScoreText(Math.round($combinedScore))}</p>
                        </div>
                    </div>
                    
                    <button
                        class="glass-button-small"
                        onclick={handleRescore}
                        disabled={isRescoring}
                    >
                        {#if isRescoring}
                            <div class="w-3 h-3 border-2 border-blue border-t-transparent rounded-full animate-spin"></div>
                            <span>Scoring...</span>
                        {:else}
                            <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                            </svg>
                            <span>Refresh</span>
                        {/if}
                    </button>
                </div>
                
                <!-- Progress Bar -->
                <div class="glass-progress-container">
                    <div class="glass-progress-bar {getScoreColor(Math.round($combinedScore))}" style="width: {$combinedScore}%"></div>
                </div>
                <div class="flex justify-between text-xs text-subtext1 mt-1 px-1">
                    <span>0%</span>
                    <span>100%</span>
                </div>
            </div>

            <!-- Keywords Grid -->
            <div class="flex-1 min-h-0">
                <div class="grid grid-cols-2 gap-3 h-full">
                    <!-- Resume Keywords -->
                    <div class="flex flex-col min-h-0">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-1.5 h-1.5 rounded-full bg-peach"></div>
                            <h3 class="text-sm font-semibold text-text">Resume Keywords</h3>
                            <div class="glass-badge-small">{$resumeKeywords.length}</div>
                        </div>
                        <div class="glass-keyword-container">
                            {#each $resumeKeywords as resumeKeyword}
                                <div class="keyword-badge {$overlappingKeywords.includes(resumeKeyword) ? 'keyword-matched' : 'keyword-unmatched'}">
                                    {#if $overlappingKeywords.includes(resumeKeyword)}
                                        <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                    {resumeKeyword}
                                </div>
                            {/each}
                        </div>
                    </div>

                    <!-- Job Keywords -->
                    <div class="flex flex-col min-h-0">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-1.5 h-1.5 rounded-full bg-blue"></div>
                            <h3 class="text-sm font-semibold text-text">Job Keywords</h3>
                            <div class="glass-badge-small">{$jobKeywords.length}</div>
                        </div>
                        <div class="glass-keyword-container">
                            {#each $jobKeywords as jobKeyword}
                                <div class="keyword-badge {$overlappingKeywords.includes(jobKeyword) ? 'keyword-matched' : 'keyword-unmatched'}">
                                    {#if $overlappingKeywords.includes(jobKeyword)}
                                        <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                    {jobKeyword}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Tune Button -->
            <div class="mt-4">
                <button class="ai-button" class:streaming={$isStreaming} onclick={tuneResume} disabled={$tuning}>
                    {#if $tuning}
                        <div class="ai-button-content">
                            <div class="ai-spinner" class:streaming-spinner={$isStreaming}></div>
                            {#if $isStreaming}
                                <span>Streaming AI Response...</span>
                            {:else}
                                <span>Optimizing Resume...</span>
                            {/if}
                        </div>
                        {#if $isStreaming}
                            <div class="streaming-progress"></div>
                        {/if}
                    {:else}
                        <div class="ai-button-content">
                            <div class="ai-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
                                </svg>
                            </div>
                            <span>AI Optimize</span>
                            <div class="ai-status-dot"></div>
                        </div>
                    {/if}
                </button>
                
            </div>
        </div>
    </div>
{:else}
    <div class="w-full h-full glass-container">
        <div class="w-full h-full glass-panel flex items-center justify-center">
            <div class="text-center p-8">
                <div class="w-16 h-16 mx-auto mb-4 glass-icon-container">
                    <svg class="w-8 h-8 text-subtext0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-text mb-2">Ready to Analyze</h3>
                <p class="text-subtext0">Add a job description to start analyzing your resume match</p>
            </div>
        </div>
    </div>
{/if}

<style>
    .glass-container {
        background: linear-gradient(135deg, 
            rgba(137, 180, 250, 0.02) 0%, 
            rgba(116, 199, 236, 0.015) 25%, 
            rgba(166, 227, 161, 0.01) 50%, 
            rgba(250, 179, 135, 0.015) 75%, 
            rgba(243, 139, 168, 0.02) 100%
        );
        border: 1px solid rgba(116, 199, 236, 0.15);
        border-radius: 8px;
    }

    .glass-panel {
        background: rgba(30, 30, 46, 0.15);
        border: 1px solid rgba(116, 199, 236, 0.08);
        border-radius: 8px;
        margin: 0.25rem;
    }

    .score-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }


    .glass-button-small {
        background: rgba(30, 30, 46, 0.3);
        border: 1px solid rgba(116, 199, 236, 0.2);
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        color: rgb(205, 214, 244);
        font-size: 0.75rem;
        transition: all 0.15s ease-out;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .glass-button-small:hover:not(:disabled) {
        background: rgba(30, 30, 46, 0.5);
        border-color: rgba(116, 199, 236, 0.4);
        transform: translateY(-1px);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        transition: none;
    }

    .glass-button-small:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .glass-progress-container {
        width: 100%;
        height: 8px;
        background: rgba(49, 50, 68, 0.5);
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid rgba(116, 199, 236, 0.1);
    }

    .glass-progress-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 1s ease-out;
        position: relative;
        overflow: hidden;
    }


    .glass-keyword-container {
        background: rgba(30, 30, 46, 0.1);
        border: 1px solid rgba(137, 180, 250, 0.08);
        border-radius: 0.5rem;
        padding: 0.75rem;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-content: flex-start;
    }

    .glass-keyword-container::-webkit-scrollbar {
        width: 6px;
    }

    .glass-keyword-container::-webkit-scrollbar-track {
        background: transparent;
    }

    .glass-keyword-container::-webkit-scrollbar-thumb {
        background: rgba(137, 180, 250, 0.3);
        border-radius: 3px;
    }

    .keyword-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .keyword-matched {
        background: rgba(166, 227, 161, 0.2);
        border: 1px solid rgba(166, 227, 161, 0.4);
        color: rgb(166, 227, 161);
    }

    .keyword-unmatched {
        background: rgba(49, 50, 68, 0.3);
        border: 1px solid rgba(108, 112, 134, 0.2);
        color: rgb(205, 214, 244);
    }

    .glass-badge-small {
        background: rgba(49, 50, 68, 0.6);
        border: 1px solid rgba(137, 180, 250, 0.2);
        border-radius: 1rem;
        padding: 0.125rem 0.5rem;
        font-size: 0.7rem;
        color: rgb(166, 173, 200);
    }

    .ai-button {
        width: 100%;
        background: rgba(30, 30, 46, 0.3);
        border: 1px solid rgba(116, 199, 236, 0.3);
        border-radius: 8px;
        padding: 0.875rem 1.25rem;
        color: rgb(205, 214, 244);
        font-weight: 500;
        font-size: 0.875rem;
        transition: all 0.15s ease-out;
        position: relative;
        overflow: hidden;
        cursor: pointer;
    }

    .ai-button:hover:not(:disabled) {
        background: rgba(30, 30, 46, 0.5);
        border-color: rgba(116, 199, 236, 0.5);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: none;
    }

    .ai-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .ai-button-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .ai-icon {
        width: 16px;
        height: 16px;
        color: rgb(137, 180, 250);
    }

    .ai-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(137, 180, 250, 0.3);
        border-top: 2px solid rgb(137, 180, 250);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .ai-status-dot {
        width: 6px;
        height: 6px;
        background: rgb(166, 227, 161);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
    }

    @keyframes streamingGlow {
        0%, 100% { 
            border-color: rgba(116, 199, 236, 0.3);
            box-shadow: 0 0 0 0 rgba(116, 199, 236, 0.3);
        }
        50% { 
            border-color: rgba(137, 180, 250, 0.8);
            box-shadow: 0 0 20px 2px rgba(137, 180, 250, 0.2);
        }
    }

    @keyframes progressFlow {
        0% { left: -100%; }
        100% { left: 100%; }
    }


    .ai-button.streaming {
        animation: streamingGlow 2s ease-in-out infinite;
        background: rgba(30, 30, 46, 0.4);
    }

    .streaming-spinner {
        border-color: rgba(137, 180, 250, 0.2);
        border-top-color: rgb(137, 180, 250);
        border-right-color: rgb(116, 199, 236);
        animation: spin 0.8s linear infinite;
    }

    .streaming-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: rgba(137, 180, 250, 0.1);
        overflow: hidden;
    }

    .streaming-progress::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(137, 180, 250, 0.8) 50%, 
            transparent 100%
        );
        animation: progressFlow 1.5s ease-in-out infinite;
    }


    .glass-icon-container {
        background: rgba(49, 50, 68, 0.3);
        border: 1px solid rgba(137, 180, 250, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

</style>
