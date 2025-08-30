<script lang="ts">
    import { hasSeenWelcome } from "./utils/stores.js";
    import { onMount } from "svelte";
    import Button from "$ui/Button.svelte";
    
    let ready = $state(false);
    let showWelcome = $derived(ready && !$hasSeenWelcome);
    
    onMount(() => {
        setTimeout(() => {
            ready = true;
        }, 500);
    });
    
    function closeWelcome() {
        $hasSeenWelcome = true;
    }
    
    function goToHelp() {
        closeWelcome();
        window.open('https://github.com/Shlok-Bhakta/ResuMate/blob/main/README.md', '_blank');
    }
</script>

{#if showWelcome}
    <!-- Backdrop -->
    <div 
        class="fixed inset-0 glass-modal-backdrop z-50 flex items-center justify-center p-4"
        role="dialog" 
        aria-modal="true"
        aria-labelledby="welcome-title"
        tabindex="0"
        onclick={closeWelcome}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeWelcome(); }}
    >
        <!-- Modal -->
        <div 
            class="welcome-modal max-w-md w-full mx-auto"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
            role="button"
            tabindex="0"
        >
            <!-- Header -->
            <div class="welcome-header">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue to-purple flex items-center justify-center">
                        <span class="text-lg">📃</span>
                    </div>
                    <h1 id="welcome-title" class="text-xl font-bold text-text">Welcome to ResuMate!</h1>
                </div>
                
                <p class="text-subtext1 text-sm leading-relaxed mb-6">
                    Thanks for trying ResuMate! This app helps you create AI-optimized resumes that match job descriptions perfectly.
                </p>
                
                <div class="bg-surface0/50 rounded-lg p-4 mb-6 border border-surface1/50">
                    <h3 class="text-sm font-semibold text-text mb-2">🚀 Quick Start Tips:</h3>
                    <ul class="text-xs text-subtext1 space-y-1">
                        <li>• Go to Settings first to set up your profile</li>
                        <li>• Optionally add an OpenRouter API key for AI features</li>
                        <li>• Create a new project and paste a job description</li>
                        <li>• Watch your resume score improve in real-time!</li>
                    </ul>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="welcome-actions">
                <Button
                    variant="style2"
                    size="medium"
                    onclick={goToHelp}
                    class="welcome-button-primary"
                >
                    {#snippet children()}
                        📚 Read the Guide
                    {/snippet}
                </Button>
                <Button
                    variant="style1"
                    size="medium"
                    onclick={closeWelcome}
                    class="welcome-button-secondary"
                >
                    {#snippet children()}
                        Let's Go!
                    {/snippet}
                </Button>
            </div>
        </div>
    </div>
{/if}

<style>
    .glass-modal-backdrop {
        background: linear-gradient(135deg, 
            rgba(17, 17, 27, 0.85) 0%, 
            rgba(24, 24, 37, 0.9) 50%, 
            rgba(17, 17, 27, 0.85) 100%
        );
        backdrop-filter: saturate(180%) contrast(120%);
    }

    .welcome-modal {
        background: linear-gradient(145deg, 
            rgba(30, 30, 46, 0.95) 0%, 
            rgba(17, 17, 27, 0.98) 100%
        );
        border: 1px solid rgba(137, 180, 250, 0.2);
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(137, 180, 250, 0.1);
    }
    
    .welcome-header {
        border-bottom: 1px solid rgba(69, 71, 90, 0.5);
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }
    
    .welcome-actions {
        display: flex;
        gap: 0.75rem;
        flex-direction: column;
    }
    
    .welcome-button-primary {
        background: linear-gradient(135deg, rgb(137, 180, 250), rgb(180, 190, 254));
        color: rgb(17, 17, 27);
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .welcome-button-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(137, 180, 250, 0.4);
    }
    
    .welcome-button-secondary {
        background: rgba(69, 71, 90, 0.8);
        color: rgb(205, 214, 244);
        border: 1px solid rgba(137, 180, 250, 0.3);
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .welcome-button-secondary:hover {
        background: rgba(69, 71, 90, 1);
        border-color: rgba(137, 180, 250, 0.5);
    }
    
    @media (min-width: 640px) {
        .welcome-actions {
            flex-direction: row;
        }
        
        .welcome-button-primary,
        .welcome-button-secondary {
            flex: 1;
        }
    }
</style>