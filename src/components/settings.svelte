<script lang="ts">
    import {
        modalState,
        name,
        email,
        phone,
        website,
        linkedin,
        github,
        address,
        enableEmail,
        enablePhone,
        enableWebsite,
        enableLinkedin,
        enableGithub,
        enableAddress,
        showUSCitizenship,
        customHeader,
        enableCustomHeader,
        customCSS,
        enableCustomCSS,
        resumeTemplate,
        createHeader,
        resetApplication,
        importIndexedDBs,
        downloadDBasJSON,
        openRouterKey,
        knowlegeBase,
        openRouterAIModel,
        keywords,
    } from "$utils";
    import { removeManualKeyword } from "$lib/components/utils/db.ts";
    import "./settingseditor.css";
    import MonacoStoreEditor from "./ui/MonacoStoreEditor.svelte";
    import Button from "$ui/Button.svelte";

    // Active tab state
    let activeTab = $state<'profile' | 'ai' | 'advanced' | 'sync'>('profile');

    // Reset confirmation state
    let resetConfirmationState = $state(0);

    // Keywords state
    let keywordSearch = $state("");
    let newKeyword = $state("");

    // AI model dropdown state
    let usableModels: any[] = $state([]);
    let showModelDropdown = $state(false);

    // PeerJS state
    import { PeerSync, type SyncStatus } from './utils/peerSync';
    let peerSync: PeerSync | null = null;
    let syncStatus = $state<SyncStatus>({ status: 'idle', message: '' });
    let syncTab = $state<'send' | 'receive'>('send');
    let receiverCode = $state('');
    let showImportConfirm = $state(false);
    let fileInput: HTMLInputElement;

    // Monaco editor - no setup needed!

    function close() {
        modalState.set("None");
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            e.stopPropagation();
            close();
        }
    }

    // Reset handler
    function handleResetClick() {
        if (resetConfirmationState === 0) {
            resetConfirmationState = 1;
            return;
        }
        if (resetConfirmationState === 1) {
            resetConfirmationState = 2;
            return;
        }
        resetApplication();
        resetConfirmationState = 0;
    }

    $effect(() => {
        if (resetConfirmationState > 0) {
            const timer = setTimeout(() => {
                resetConfirmationState = 0;
            }, 3000);
            return () => clearTimeout(timer);
        }
    });

    // Template fetching
    async function fetchResTemplate() {
        try {
            console.log('Fetching template...');
            const response = await fetch("/ResuMate/template.md");
            if (response.ok) {
                const text = await response.text();
                console.log('Template fetched, length:', text.length);
                $resumeTemplate = text;
                console.log('resumeTemplate store updated');
            } else {
                console.error('Failed to fetch template:', response.status);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    async function fetchKnowledgeBase() {
        try {
            const response = await fetch("/ResuMate/knowledge.md");
            if (response.ok) {
                $knowlegeBase = await response.text();
            }
        } catch (err) {
            console.error(err);
        }
    }

    // AI models
    async function fetchModels() {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/models");
            const data = await response.json();
            usableModels = data["data"];
        } catch (err) {
            console.error(err);
        }
    }

    // Keywords management
    function addKeyword() {
        if (newKeyword.trim()) {
            keywords.update(kws => {
                const updatedKeywords = [...kws, newKeyword.trim()];
                updatedKeywords.sort((a, b) => b.length - a.length);
                return updatedKeywords;
            });
            newKeyword = '';
        }
    }


    // File upload
    function handleFileUpload(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        console.log("File selected:", file.name, file.size, "bytes");

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                if (e.target?.result && typeof e.target.result === "string") {
                    console.log("File content length:", e.target.result.length);
                    await importIndexedDBs(e.target.result);
                    console.log("Import completed successfully");
                }
            } catch (error) {
                console.error("Error importing file:", error);
                alert(`Import failed: ${error.message || error}`);
            }
        };
        reader.onerror = function() {
            console.error("Error reading file");
            alert("Error reading file");
        };
        reader.readAsText(file);
    }

    // PeerJS functions
    function initPeerSync() {
        if (peerSync) {
            peerSync.cleanup();
        }
        peerSync = new PeerSync((status) => {
            syncStatus = status;
            if (status.status === 'receiving') {
                showImportConfirm = true;
            }
        });
    }

    function startSender() {
        syncTab = 'send';
        initPeerSync();
        peerSync?.startSender();
    }

    function startReceiver() {
        syncTab = 'receive';
        if (!receiverCode.trim()) {
            syncStatus = { status: 'error', message: 'Please enter a code', error: 'No code provided' };
            return;
        }
        initPeerSync();
        peerSync?.connectToSender(receiverCode.trim());
    }

    function resetSync() {
        peerSync?.cleanup();
        syncStatus = { status: 'idle', message: '' };
        receiverCode = '';
        showImportConfirm = false;
    }

    // Monaco editor - no initialization needed!

    // Auto-update header when profile changes
    $effect(() => {
        $name; $email; $enableEmail; $phone; $enablePhone;
        $website; $enableWebsite; $linkedin; $enableLinkedin;
        $github; $enableGithub; $address; $enableAddress;
        $showUSCitizenship;
        createHeader();
    });
</script>

<div 
    class="glass-settings-container"
    onkeydown={onKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-title"
    tabindex="0"
>
    <div class="glass-settings-panel">
        <!-- Header -->
        <header class="glass-settings-header">
            <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-purple animate-pulse"></div>
                <h1 id="settings-title" class="text-2xl font-bold text-text">Settings</h1>
            </div>
            <Button
                variant="icon"
                size="small"
                onclick={close}
                aria-label="Close settings"
            >
                {#snippet children()}
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                {/snippet}
            </Button>
        </header>

        <!-- Tab Navigation -->
        <nav class="glass-settings-nav">
            <Button
                variant={activeTab === 'profile' ? 'style2' : 'style1'}
                size="small"
                onclick={() => activeTab = 'profile'}
                class="glass-tab {activeTab === 'profile' ? 'glass-tab-active' : 'glass-tab-inactive'}"
            >
                {#snippet children()}
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    Profile
                {/snippet}
            </Button>
            <Button
                variant={activeTab === 'ai' ? 'style2' : 'style1'}
                size="small"
                onclick={() => activeTab = 'ai'}
                class="glass-tab {activeTab === 'ai' ? 'glass-tab-active' : 'glass-tab-inactive'}"
            >
                {#snippet children()}
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AI & Keywords
                {/snippet}
            </Button>
            <Button
                variant={activeTab === 'advanced' ? 'style2' : 'style1'}
                size="small"
                onclick={() => activeTab = 'advanced'}
                class="glass-tab {activeTab === 'advanced' ? 'glass-tab-active' : 'glass-tab-inactive'}"
            >
                {#snippet children()}
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                    </svg>
                    Advanced
                {/snippet}
            </Button>
            <Button
                variant={activeTab === 'sync' ? 'style2' : 'style1'}
                size="small"
                onclick={() => activeTab = 'sync'}
                class="glass-tab {activeTab === 'sync' ? 'glass-tab-active' : 'glass-tab-inactive'}"
            >
                {#snippet children()}
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                    </svg>
                    Sync & Data
                {/snippet}
            </Button>
        </nav>

        <!-- Tab Content -->
        <div class="glass-settings-content">
            {#if activeTab === 'profile'}
                <div class="glass-section">
                    <div class="glass-section-header">
                        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                        <h2>Personal Information</h2>
                    </div>

                    <div class="glass-form-grid">
                        <!-- Name -->
                        <div class="glass-form-group">
                            <label class="glass-label" for="full-name-input">Full Name</label>
                            <input id="full-name-input" class="glass-input" bind:value={$name} placeholder="Your full name" />
                        </div>

                        <!-- Contact Fields -->
                        <div class="glass-form-group">
                            <label class="glass-label-toggle">
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                Email
                                <input type="checkbox" class="glass-toggle" bind:checked={$enableEmail} />
                            </label>
                            <input class="glass-input" bind:value={$email} disabled={!$enableEmail} placeholder="your@email.com" />
                        </div>

                        <div class="glass-form-group">
                            <label class="glass-label-toggle">
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                Phone
                                <input type="checkbox" class="glass-toggle" bind:checked={$enablePhone} />
                            </label>
                            <input class="glass-input" bind:value={$phone} disabled={!$enablePhone} placeholder="+1 (555) 123-4567" />
                        </div>

                        <div class="glass-form-group">
                            <label class="glass-label-toggle">
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd" />
                                </svg>
                                Website
                                <input type="checkbox" class="glass-toggle" bind:checked={$enableWebsite} />
                            </label>
                            <input class="glass-input" bind:value={$website} disabled={!$enableWebsite} placeholder="https://yourwebsite.com" />
                        </div>

                        <div class="glass-form-group">
                            <label class="glass-label-toggle">
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
                                </svg>
                                LinkedIn
                                <input type="checkbox" class="glass-toggle" bind:checked={$enableLinkedin} />
                            </label>
                            <input class="glass-input" bind:value={$linkedin} disabled={!$enableLinkedin} placeholder="linkedin.com/in/username" />
                        </div>

                        <div class="glass-form-group">
                            <label class="glass-label-toggle">
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
                                </svg>
                                GitHub
                                <input type="checkbox" class="glass-toggle" bind:checked={$enableGithub} />
                            </label>
                            <input class="glass-input" bind:value={$github} disabled={!$enableGithub} placeholder="github.com/username" />
                        </div>

                        <div class="glass-form-group">
                            <label class="glass-label-toggle">
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                                </svg>
                                Address
                                <input type="checkbox" class="glass-toggle" bind:checked={$enableAddress} />
                            </label>
                            <input class="glass-input" bind:value={$address} disabled={!$enableAddress} placeholder="City, State/Country" />
                        </div>

                        <div class="glass-form-group">
                            <label class="glass-label-toggle">
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
                                </svg>
                                US Citizenship
                                <input type="checkbox" class="glass-toggle" bind:checked={$showUSCitizenship} />
                            </label>
                        </div>
                    </div>
                </div>

            {:else if activeTab === 'ai'}
                <div class="glass-section">
                    <div class="glass-section-header">
                        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2>AI Configuration</h2>
                    </div>

                    <div class="glass-form-grid">
                        <div class="glass-form-group glass-form-wide">
                            <label class="glass-label" for="openrouter-api-key">OpenRouter API Key</label>
                            <p class="glass-description">
                                Get your API key from <a href="https://openrouter.ai/settings/keys" target="_blank" rel="noopener noreferrer" class="glass-link">OpenRouter</a> to enable AI-powered resume tuning.
                            </p>
                            <input 
                                id="openrouter-api-key"
                                type="password" 
                                class="glass-input" 
                                bind:value={$openRouterKey} 
                                placeholder="sk-or-v1-..." 
                            />
                        </div>

                        <div class="glass-form-group glass-form-wide">
                            <label class="glass-label" for="ai-model-input">AI Model</label>
                            <div class="glass-dropdown-container">
                                <input
                                    id="ai-model-input"
                                    type="text"
                                    class="glass-input"
                                    bind:value={$openRouterAIModel}
                                    placeholder="Search for a model..."
                                    onfocus={() => {
                                        if (usableModels.length === 0) fetchModels();
                                        showModelDropdown = true;
                                    }}
                                    onblur={() => setTimeout(() => showModelDropdown = false, 200)}
                                />
                                {#if showModelDropdown && usableModels.length > 0}
                                    <div class="glass-dropdown">
                                        {#each usableModels.filter(model => !$openRouterAIModel || model.name.toLowerCase().includes($openRouterAIModel.toLowerCase())) as model}
                                            <Button
                                                variant="style1"
                                                size="small"
                                                class="glass-dropdown-item"
                                                onmousedown={() => $openRouterAIModel = model.id}
                                            >
                                                {#snippet children()}
                                                    {model.name}
                                                {/snippet}
                                            </Button>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="glass-section">
                    <div class="glass-section-header">
                        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clip-rule="evenodd" />
                        </svg>
                        <h2>Keywords Management</h2>
                    </div>

                    <div class="glass-keywords-manager">
                        <div class="glass-keywords-actions">
                            <input
                                type="text"
                                class="glass-input flex-1"
                                bind:value={newKeyword}
                                placeholder="Add new keyword..."
                                onkeydown={(e) => e.key === 'Enter' && addKeyword()}
                            />
                            <Button variant="style2" size="medium" onclick={addKeyword}>
                                {#snippet children()}
                                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                                    </svg>
                                    Add
                                {/snippet}
                            </Button>
                        </div>

                        <input
                            type="text"
                            class="glass-input"
                            bind:value={keywordSearch}
                            placeholder="Search keywords..."
                        />

                        <div class="glass-keywords-list">
                            {#each $keywords.filter(kw => keywordSearch.trim() === '' || kw.toLowerCase().includes(keywordSearch.toLowerCase())) as keyword}
                                <div class="glass-keyword-item">
                                    <span>{keyword}</span>
                                    <Button variant="danger" size="small" onclick={() => removeManualKeyword(keyword)} aria-label={`Remove keyword ${keyword}`}>
                                        {#snippet children()}
                                            <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                            </svg>
                                        {/snippet}
                                    </Button>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

            {:else if activeTab === 'advanced'}
                <div class="glass-section">
                    <div class="glass-section-header">
                        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <h2>Resume Template</h2>
                    </div>

                    <div class="glass-template-section">
                        <Button variant="style1" size="medium" onclick={fetchResTemplate}>
                            {#snippet children()}
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                                Fetch Default Template
                            {/snippet}
                        </Button>

                        <div class="glass-editor-container glass-editor-large">
                            <MonacoStoreEditor
                                store={resumeTemplate}
                                language="markdown"
                                height="100%"
                            />
                        </div>
                    </div>
                </div>

                <div class="glass-section">
                    <div class="glass-section-header">
                        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                        <h2>Knowledge Base</h2>
                    </div>

                    <div class="glass-template-section">
                        <Button variant="style1" size="medium" onclick={fetchKnowledgeBase}>
                            {#snippet children()}
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                                Fetch Sample Knowledge Base
                            {/snippet}
                        </Button>
                        <p class="glass-description">Knowledge passed to the AI when tuning your resume.</p>

                        <div class="glass-editor-container glass-editor-large">
                            <MonacoStoreEditor
                                store={knowlegeBase}
                                language="markdown"
                                height="100%"
                            />
                        </div>
                    </div>
                </div>

            {:else if activeTab === 'sync'}
                <div class="glass-section">
                    <div class="glass-section-header">
                        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                        </svg>
                        <h2>Device Sync</h2>
                    </div>

                    <div class="glass-sync-tabs">
                        <Button
                            variant={syncTab === 'send' ? 'style2' : 'style1'}
                            size="medium"
                            onclick={() => { syncTab = 'send'; resetSync(); }}
                            class="flex-1"
                        >
                            {#snippet children()}
                                Send Data
                            {/snippet}
                        </Button>
                        <Button
                            variant={syncTab === 'receive' ? 'style2' : 'style1'}
                            size="medium"
                            onclick={() => { syncTab = 'receive'; resetSync(); }}
                            class="flex-1"
                        >
                            {#snippet children()}
                                Receive Data
                            {/snippet}
                        </Button>
                    </div>

                    {#if syncTab === 'send'}
                        <div class="glass-sync-content">
                            <p class="glass-description">Share your resume data with another device</p>
                            
                            {#if syncStatus.code}
                                <div class="glass-code-display">
                                    <p class="glass-description">Share this code:</p>
                                    <div class="glass-code">{syncStatus.code}</div>
                                </div>
                            {/if}
                            
                            <Button
                                variant="style2"
                                size="medium"
                                onclick={startSender}
                                disabled={['waiting', 'connected', 'sending'].includes(syncStatus.status)}
                            >
                                {#snippet children()}
                                    Generate Code
                                {/snippet}
                            </Button>
                        </div>
                    {:else}
                        <div class="glass-sync-content">
                            <p class="glass-description">Enter the code from the sending device</p>
                            
                            <input
                                class="glass-input"
                                bind:value={receiverCode}
                                placeholder="Enter code here (e.g., cat-dog-42)"
                            />
                            
                            <Button
                                variant="style2"
                                size="medium"
                                onclick={startReceiver}
                                disabled={['waiting', 'connected', 'receiving'].includes(syncStatus.status)}
                            >
                                {#snippet children()}
                                    Connect & Receive
                                {/snippet}
                            </Button>
                        </div>
                    {/if}

                    {#if syncStatus.status !== 'idle'}
                        <div class="glass-status-display glass-status-{syncStatus.status}">
                            <div class="glass-status-indicator"></div>
                            <div>
                                <div class="glass-status-title">{syncStatus.status}</div>
                                <div class="glass-status-message">{syncStatus.message}</div>
                                {#if syncStatus.error}
                                    <div class="glass-status-error">{syncStatus.error}</div>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    {#if showImportConfirm}
                        <div class="glass-import-confirm">
                            <p class="glass-import-title">Import received data?</p>
                            <p class="glass-description">This will replace your current data.</p>
                            <div class="glass-import-actions">
                                <Button variant="success" size="medium" onclick={() => showImportConfirm = false}>
                                    {#snippet children()}
                                        Import
                                    {/snippet}
                                </Button>
                                <Button variant="danger" size="medium" onclick={() => { showImportConfirm = false; resetSync(); }}>
                                    {#snippet children()}
                                        Cancel
                                    {/snippet}
                                </Button>
                            </div>
                        </div>
                    {/if}
                </div>

                <div class="glass-section">
                    <div class="glass-section-header">
                        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                        <h2>Data Management</h2>
                    </div>

                    <div class="glass-data-actions">
                        <Button variant="style1" size="medium" onclick={downloadDBasJSON}>
                            {#snippet children()}
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                                Download Data
                            {/snippet}
                        </Button>

                        <input type="file" accept=".json" onchange={handleFileUpload} bind:this={fileInput} style="display: none;" />
                        <Button variant="style1" size="medium" onclick={() => fileInput?.click()}>
                            {#snippet children()}
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                </svg>
                                Upload Data
                            {/snippet}
                        </Button>

                        <Button 
                            variant="danger"
                            size="medium"
                            onclick={handleResetClick}
                            class={resetConfirmationState > 0 ? 'glass-button-shake' : ''}
                        >
                            {#snippet children()}
                                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                                {#if resetConfirmationState === 0}
                                    Reset Application
                                {:else if resetConfirmationState === 1}
                                    Are you sure?
                                {:else}
                                    ARE YOU REALLY SURE?
                                {/if}
                            {/snippet}
                        </Button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .glass-settings-container {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 2rem;
        background: rgba(0, 0, 0, 0.7);
    }

    .glass-settings-panel {
        background: rgba(22, 18, 32, 0.95);
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        color: rgb(205, 214, 244);
        width: 100%;
        max-width: 80rem;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
    }

    .glass-settings-panel::before {
        content: '';
        position: absolute;
        inset: -1px;
        padding: 1px;
        background: linear-gradient(135deg, 
            rgba(180, 120, 250, 0.35) 0%,
            rgba(203, 166, 247, 0.3) 25%,
            rgba(160, 110, 240, 0.25) 50%,
            rgba(203, 166, 247, 0.3) 75%,
            rgba(180, 120, 250, 0.35) 100%
        );
        border-radius: 1rem;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: subtract;
        z-index: -1;
    }

    .glass-settings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid rgba(180, 120, 250, 0.25);
    }

    .glass-icon-button {
        background: rgba(17, 17, 27, 0.6);
        border: 1px solid rgba(137, 180, 250, 0.3);
        border-radius: 0.5rem;
        color: rgb(205, 214, 244);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .glass-icon-button:hover {
        background: rgba(17, 17, 27, 0.8);
        border-color: rgba(137, 180, 250, 0.5);
        transform: translateY(-1px);
    }

    .glass-settings-nav {
        display: flex;
        padding: 0 2rem;
        border-bottom: 1px solid rgba(137, 180, 250, 0.2);
        gap: 0.25rem;
    }

    .glass-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        background: none;
        border: none;
        color: rgb(186, 194, 222);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 2px solid transparent;
    }

    .glass-tab-active {
        color: rgb(137, 180, 250);
        border-bottom-color: rgb(137, 180, 250);
    }

    .glass-tab-inactive:hover {
        color: rgb(205, 214, 244);
        background: rgba(137, 180, 250, 0.1);
    }

    .glass-settings-content {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .glass-section {
        background: rgba(18, 16, 28, 0.4);
        border-radius: 0.75rem;
        padding: 1.5rem;
        position: relative;
    }

    .glass-section::before {
        content: '';
        position: absolute;
        inset: -1px;
        padding: 1px;
        background: linear-gradient(135deg, 
            rgba(180, 120, 250, 0.2) 0%,
            rgba(203, 166, 247, 0.15) 25%,
            rgba(160, 110, 240, 0.12) 50%,
            rgba(203, 166, 247, 0.15) 75%,
            rgba(180, 120, 250, 0.2) 100%
        );
        border-radius: 0.75rem;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: subtract;
        z-index: -1;
    }

    .glass-section-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        color: rgb(137, 180, 250);
    }

    .glass-section-header h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
    }

    .glass-form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
        gap: 1.5rem;
    }

    .glass-form-wide {
        grid-column: 1 / -1;
    }

    .glass-form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .glass-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: rgb(205, 214, 244);
    }

    .glass-label-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgb(205, 214, 244);
        gap: 0.5rem;
    }

    .glass-input {
        background: rgba(18, 16, 28, 0.85);
        border: 2px solid rgba(180, 120, 250, 0.4) !important;
        border-radius: 0.5rem;
        color: rgb(205, 214, 244);
        padding: 0.75rem;
        font-size: 0.875rem;
        outline: none;
        transition: all 0.2s ease;
    }

    .glass-input:focus {
        border-color: rgba(180, 120, 250, 0.8) !important;
        box-shadow: 0 0 0 2px rgba(180, 120, 250, 0.3);
        background: rgba(18, 16, 28, 0.9);
    }

    .glass-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .glass-input::placeholder {
        color: rgb(108, 112, 134);
    }

    .glass-toggle {
        width: 2.5rem;
        height: 1.25rem;
        background: rgba(108, 112, 134, 0.3);
        border: 1px solid rgba(137, 180, 250, 0.3);
        border-radius: 1rem;
        position: relative;
        appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .glass-toggle:checked {
        background: rgba(137, 180, 250, 0.6);
        border-color: rgba(137, 180, 250, 0.8);
    }

    .glass-toggle::before {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        width: 1rem;
        height: 1rem;
        background: rgb(205, 214, 244);
        border-radius: 50%;
        transition: transform 0.2s ease;
    }

    .glass-toggle:checked::before {
        transform: translateX(1.25rem);
    }

    .glass-description {
        font-size: 0.875rem;
        color: rgb(186, 194, 222);
        margin: 0;
    }

    .glass-link {
        color: rgb(137, 180, 250);
        text-decoration: underline;
    }

    .glass-link:hover {
        color: rgb(116, 199, 236);
    }

    .glass-dropdown-container {
        position: relative;
    }

    .glass-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(17, 17, 27, 0.95);
        border: 1px solid rgba(137, 180, 250, 0.3);
        border-radius: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
        z-index: 10;
        margin-top: 0.25rem;
    }

    .glass-dropdown-item {
        width: 100%;
        padding: 0.75rem;
        background: none;
        border: none;
        color: rgb(205, 214, 244);
        text-align: left;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .glass-dropdown-item:hover {
        background: rgba(137, 180, 250, 0.1);
    }

    .glass-keywords-manager {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .glass-keywords-actions {
        display: flex;
        gap: 0.75rem;
    }

    .glass-keywords-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 300px;
        overflow-y: auto;
        padding: 1rem;
        background: rgba(17, 17, 27, 0.5);
        border: 1px solid rgba(137, 180, 250, 0.15);
        border-radius: 0.5rem;
    }

    .glass-keyword-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: rgba(137, 180, 250, 0.1);
        border: 1px solid rgba(137, 180, 250, 0.3);
        border-radius: 0.5rem;
        font-size: 0.875rem;
    }

    .glass-button-primary {
        background: linear-gradient(135deg, rgba(137, 180, 250, 0.8) 0%, rgba(116, 199, 236, 0.9) 100%);
        border: 1px solid rgba(137, 180, 250, 0.4);
        border-radius: 0.5rem;
        color: rgb(17, 17, 27);
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
    }

    .glass-button-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(137, 180, 250, 0.9) 0%, rgba(116, 199, 236, 1) 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(137, 180, 250, 0.3);
    }

    .glass-button-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .glass-button-secondary {
        background: rgba(17, 17, 27, 0.6);
        border: 1px solid rgba(137, 180, 250, 0.3);
        border-radius: 0.5rem;
        color: rgb(205, 214, 244);
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
    }

    .glass-button-secondary:hover {
        background: rgba(17, 17, 27, 0.8);
        border-color: rgba(137, 180, 250, 0.5);
        transform: translateY(-1px);
    }

    .glass-button-danger {
        background: rgba(243, 139, 168, 0.2);
        border: 1px solid rgba(243, 139, 168, 0.4);
        border-radius: 0.5rem;
        color: rgb(243, 139, 168);
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
    }

    .glass-button-danger:hover {
        background: rgba(243, 139, 168, 0.3);
        border-color: rgba(243, 139, 168, 0.6);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(243, 139, 168, 0.2);
    }

    .glass-button-danger-small {
        background: rgba(243, 139, 168, 0.2);
        border: 1px solid rgba(243, 139, 168, 0.4);
        border-radius: 0.25rem;
        color: rgb(243, 139, 168);
        padding: 0.25rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .glass-button-danger-small:hover {
        background: rgba(243, 139, 168, 0.4);
    }

    .glass-button-success {
        background: rgba(166, 227, 161, 0.2);
        border: 1px solid rgba(166, 227, 161, 0.4);
        border-radius: 0.5rem;
        color: rgb(166, 227, 161);
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .glass-button-success:hover {
        background: rgba(166, 227, 161, 0.3);
        border-color: rgba(166, 227, 161, 0.6);
    }

    .glass-button-shake {
        animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    .glass-template-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .glass-editor-container {
        height: 400px;
        border: 1px solid rgba(137, 180, 250, 0.2);
        border-radius: 0.5rem;
        overflow: hidden;
    }

    .glass-editor-large {
        height: 800px; /* Double the size: 400px * 2 */
    }

    .glass-textarea-container {
        height: 300px;
        border: 1px solid rgba(137, 180, 250, 0.2);
        border-radius: 0.5rem;
        overflow: hidden;
    }

    .glass-textarea {
        width: 100%;
        height: 100%;
        background: rgba(17, 17, 27, 0.6);
        border: none;
        color: rgb(205, 214, 244);
        padding: 1rem;
        font-size: 0.875rem;
        line-height: 1.5;
        resize: none;
        outline: none;
    }

    .glass-textarea::placeholder {
        color: rgb(108, 112, 134);
    }

    .glass-sync-tabs {
        display: flex;
        gap: 0.25rem;
        margin-bottom: 1.5rem;
    }

    .glass-sync-tab {
        flex: 1;
        padding: 0.75rem 1rem;
        background: rgba(17, 17, 27, 0.6);
        border: 1px solid rgba(137, 180, 250, 0.2);
        color: rgb(186, 194, 222);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .glass-sync-tab:first-child {
        border-radius: 0.5rem 0 0 0.5rem;
    }

    .glass-sync-tab:last-child {
        border-radius: 0 0.5rem 0.5rem 0;
    }

    .glass-sync-tab-active {
        background: rgba(137, 180, 250, 0.2);
        border-color: rgba(137, 180, 250, 0.4);
        color: rgb(137, 180, 250);
    }

    .glass-sync-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .glass-code-display {
        background: rgba(17, 17, 27, 0.6);
        border: 1px solid rgba(137, 180, 250, 0.2);
        border-radius: 0.5rem;
        padding: 1rem;
    }

    .glass-code {
        font-family: monospace;
        font-size: 1.25rem;
        color: rgb(137, 180, 250);
        background: rgba(17, 17, 27, 0.8);
        padding: 0.75rem;
        border-radius: 0.25rem;
        text-align: center;
        user-select: all;
        margin-top: 0.5rem;
    }

    .glass-status-display {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid;
    }

    .glass-status-waiting {
        background: rgba(249, 226, 175, 0.1);
        border-color: rgba(249, 226, 175, 0.3);
        color: rgb(249, 226, 175);
    }

    .glass-status-connected,
    .glass-status-complete {
        background: rgba(166, 227, 161, 0.1);
        border-color: rgba(166, 227, 161, 0.3);
        color: rgb(166, 227, 161);
    }

    .glass-status-sending,
    .glass-status-receiving {
        background: rgba(137, 180, 250, 0.1);
        border-color: rgba(137, 180, 250, 0.3);
        color: rgb(137, 180, 250);
    }

    .glass-status-error {
        background: rgba(243, 139, 168, 0.1);
        border-color: rgba(243, 139, 168, 0.3);
        color: rgb(243, 139, 168);
    }

    .glass-status-indicator {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: currentColor;
        margin-top: 0.125rem;
        flex-shrink: 0;
    }

    .glass-status-waiting .glass-status-indicator,
    .glass-status-sending .glass-status-indicator,
    .glass-status-receiving .glass-status-indicator {
        animation: pulse 2s infinite;
    }

    .glass-status-title {
        font-weight: 600;
        text-transform: capitalize;
    }

    .glass-status-message {
        font-size: 0.875rem;
        opacity: 0.9;
        margin-top: 0.25rem;
    }

    .glass-status-error {
        font-size: 0.75rem;
        opacity: 0.8;
        margin-top: 0.25rem;
    }

    .glass-import-confirm {
        background: rgba(249, 226, 175, 0.1);
        border: 1px solid rgba(249, 226, 175, 0.3);
        border-radius: 0.5rem;
        padding: 1rem;
    }

    .glass-import-title {
        font-weight: 600;
        color: rgb(249, 226, 175);
        margin: 0 0 0.5rem 0;
    }

    .glass-import-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .glass-data-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }


    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
</style>