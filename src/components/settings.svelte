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
        cssTheme,
        // enableName,
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
        editorShortcuts,
        createHeader,
        resetApplication,
        importIndexedDBs,
        downloadDBasJSON,
        openRouterKey,
        knowlegeBase,
        openRouterAIModel,
    } from "$utils";
    import { av } from "docs/assets/render.CG3mZHYP";
    import "./settingseditor.css";
    import { Carta, MarkdownEditor } from "carta-md";

    let resetConfirmationState = $state(0);
    let resetButtonShaking = $state(false);

    function handleResetClick() {
        if (resetConfirmationState === 0) {
            resetConfirmationState = 1;
            // Reset state after 3 seconds if not clicked again
            return;
        }
        if (resetConfirmationState === 1) {
            resetConfirmationState = 2;
            // Reset state after 3 seconds if not clicked again
            return;
        }
        // Final click - reset the application
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
    async function fetchResTemplate() {
        fetch("/ResuMate/template.md")
            .then((response) => response.text())
            .then((text) => {
                $resumeTemplate = text;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    async function fetchKnowledgeBase() {
        fetch("/ResuMate/knowledge.md")
            .then((response) => response.text())
            .then((text) => {
                $knowlegeBase = text;
            })
            .catch((err) => {
                console.log(err);
            });
    }



    let carta2 = $state<any>(null);
    // Comment

    $effect(() => {
        carta2 = new Carta({
            sanitizer: false,
            theme: "catppuccin-mocha",
            extensions: [editorShortcuts],
        });
        return () => {
            carta2 = null;
        };
    });
    $effect(() => {
        // rebuild the header when any values change
        $name;
        $email;
        $enableEmail;
        $phone;
        $enablePhone;
        $website;
        $enableWebsite;
        $linkedin;
        $enableLinkedin;
        $github;
        $enableGithub;
        $address;
        $enableAddress;
        $showUSCitizenship;
        createHeader();
    });

    function handleFileUpload(event: any) {
        console.log("file upload");
        console.log(event);
        if (!event) return;
        if (!event.target) return;
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                if (!e.target) return;
                if (!e.target.result) return;
                // const jsonContent = JSON.parse(e.target.result);
                if (typeof e.target.result !== "string") return;
                importIndexedDBs(e.target.result);
            } catch (error) {
                console.error("Error parsing JSON file:", error);
            }
        };
        reader.onerror = function (e) {
            console.error("Error reading file:", e);
        };
        reader.readAsText(file);
    }

    let usableModels: any[] = $state([]);
    async function fetchModels() {
        fetch("https://openrouter.ai/api/v1/models")
            .then((response) => response.json())
            .then((data) => {
                usableModels = data["data"];
                console.log(data["data"]);
            })
            .catch((err) => {
                console.log(err);
            });
    }
    // fetchModels();

    let showModelDropdown = $state(false);
</script>

<div class="w-full h-full absolute top-0 left-0 grid grid-cols-1 bg-crust/70">
    <div
        class="w-11/12 max-h-[90vh] bg-base place-self-center rounded-lg shadow-xl overflow-hidden flex flex-col"
    >
        <div class="grid grid-cols-2 p-4">
            <button
                class="bg-red hover:bg-maroon transition-all duration-200 p-2 w-8 h-8 rounded flex items-center justify-center"
                onclick={() => {
                    $modalState = $modalState == "None" ? "Settings" : "None";
                }}
                aria-label="Close settings"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
            <h1
                class="place-self-end px-4 text-xl font-semibold flex items-center gap-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path
                        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                    />
                </svg>
                Settings
            </h1>
        </div>

        <div class="px-6 py-4 grid grid-cols-2 gap-8 modal-content flex-1 pb-8">
            <!-- Personal Information -->
            <div class="space-y-6">
                <h2
                    class="text-lg font-medium text-text mb-4 flex items-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Personal Information
                </h2>

                <!-- Name -->
                <div class="space-y-2">
                    <label
                        for="name"
                        class="text-text text-sm font-medium block">Name</label
                    >
                    <input
                        class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200"
                        bind:value={$name}
                    />
                </div>

                <!-- Contact Information -->
                <!-- Email Field -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-text text-sm font-medium flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            Email
                        </label>
                        <div
                            class="relative inline-block w-10 mr-2 align-middle select-none"
                        >
                            <label
                                class="toggle-label block overflow-hidden h-5 rounded-full bg-overlay0 cursor-pointer relative"
                            >
                                <input
                                    id="email-toggle"
                                    type="checkbox"
                                    bind:checked={$enableEmail}
                                    class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface0 border-4 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-full checked:bg-blue"
                                    aria-label="Toggle email display"
                                />
                                <label
                                    class="toggle-label block overflow-hidden h-5 rounded-full bg-overlay0 cursor-pointer"
                                    for="email-toggle"
                                ></label>
                            </label>
                        </div>
                    </div>
                    <input
                        class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        bind:value={$email}
                        disabled={!$enableEmail}
                    />
                </div>

                <!-- Phone Field -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-text text-sm font-medium flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                            Phone
                        </label>
                        <div
                            class="relative inline-block w-10 mr-2 align-middle select-none"
                        >
                            <input
                                type="checkbox"
                                bind:checked={$enablePhone}
                                class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface0 border-4 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-full checked:bg-blue"
                                aria-label="Toggle phone display"
                            />
                            <label
                                class="toggle-label block overflow-hidden h-5 rounded-full bg-overlay0 cursor-pointer"
                                for="phone-toggle"
                            ></label>
                        </div>
                    </div>
                    <input
                        class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        bind:value={$phone}
                        disabled={!$enablePhone}
                    />
                </div>

                <!-- Website Field -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-text text-sm font-medium flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                />
                            </svg>
                            Website
                        </label>
                        <div
                            class="relative inline-block w-10 mr-2 align-middle select-none"
                        >
                            <input
                                id="website-toggle"
                                type="checkbox"
                                bind:checked={$enableWebsite}
                                class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface0 border-4 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-full checked:bg-blue"
                                aria-label="Toggle website display"
                            />
                            <label
                                class="toggle-label block overflow-hidden h-5 rounded-full bg-overlay0 cursor-pointer"
                                for="website-toggle"
                            ></label>
                        </div>
                    </div>
                    <input
                        class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        bind:value={$website}
                        disabled={!$enableWebsite}
                    />
                </div>

                <!-- LinkedIn Field -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-text text-sm font-medium flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
                                />
                            </svg>
                            LinkedIn
                        </label>
                        <div
                            class="relative inline-block w-10 mr-2 align-middle select-none"
                        >
                            <input
                                id="linkedin-toggle"
                                type="checkbox"
                                bind:checked={$enableLinkedin}
                                class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface0 border-4 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-full checked:bg-blue"
                                aria-label="Toggle LinkedIn display"
                            />
                            <label
                                class="toggle-label block overflow-hidden h-5 rounded-full bg-overlay0 cursor-pointer"
                                for="linkedin-toggle"
                            ></label>
                        </div>
                    </div>
                    <input
                        class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        bind:value={$linkedin}
                        disabled={!$enableLinkedin}
                    />
                </div>

                <!-- GitHub Field -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-text text-sm font-medium flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                                />
                            </svg>
                            GitHub
                        </label>
                        <div
                            class="relative inline-block w-10 mr-2 align-middle select-none"
                        >
                            <input
                                type="checkbox"
                                bind:checked={$enableGithub}
                                class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface0 border-4 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-full checked:bg-blue"
                                aria-label="Toggle GitHub display"
                            />
                            <label
                                class="toggle-label block overflow-hidden h-5 rounded-full bg-overlay0"
                            ></label>
                        </div>
                    </div>
                    <input
                        class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        bind:value={$github}
                        disabled={!$enableGithub}
                    />
                </div>

                <!-- Address Field -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label
                            class="text-text text-sm font-medium flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            Address
                        </label>
                        <div
                            class="relative inline-block w-10 mr-2 align-middle select-none"
                        >
                            <input
                                type="checkbox"
                                bind:checked={$enableAddress}
                                class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface0 border-4 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-full checked:bg-blue"
                                aria-label="Toggle address display"
                            />
                            <label
                                class="toggle-label block overflow-hidden h-5 rounded-full bg-overlay0"
                            ></label>
                        </div>
                    </div>
                    <input
                        class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        bind:value={$address}
                        disabled={!$enableAddress}
                    />
                </div>

                <!-- US Citizenship -->
                <div class="flex items-center justify-between py-2">
                    <label
                        class="text-text text-sm font-medium flex items-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                            />
                        </svg>
                        US Citizenship
                    </label>
                    <div
                        class="relative inline-block w-10 mr-2 align-middle select-none"
                    >
                        <input
                            type="checkbox"
                            bind:checked={$showUSCitizenship}
                            class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-surface0 border-4 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-full checked:bg-blue"
                            aria-label="Toggle US citizenship display"
                        />
                        <label
                            class="toggle-label block overflow-hidden h-5 rounded-full bg-overlay0"
                        ></label>
                    </div>
                </div>

                <!-- Pick an LLM Provider -->
                <div class="space-y-2">
                    <div>
                        Use OpenRouter to tune your resume. Enter API Key.
                    </div>
                        <input type="text" placeholder="Enter your OpenRouter API Key" bind:value={$openRouterKey} class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200" />
                        <div class="flex flex-row relative">
                            <input
                                type="text"
                                placeholder="Search for a model..."
                                bind:value={$openRouterAIModel}
                                onfocus={() => {
                                    if (usableModels.length === 0) {
                                        fetchModels();
                                    }
                                    showModelDropdown = true;
                                }}
                                onblur={() => setTimeout(() => showModelDropdown = false, 200)}
                                class="w-full text-text px-3 py-2 bg-mantle rounded-md border border-surface0 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200"
                            />
                            
                            {#if showModelDropdown && usableModels.length > 0}
                                <div class="absolute z-10 top-full mt-1 left-0 right-0 bg-mantle border border-surface0 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {#each usableModels.filter(model => 
                                        !$openRouterAIModel || model.name.toLowerCase().includes($openRouterAIModel.toLowerCase())                                    ) as model}
                                        <button 
                                            class="px-3 py-2 cursor-pointer hover:bg-surface0 w-full text-left"
                                            onmousedown={() => $openRouterAIModel = model.id}
                                        >
                                            {model.name}
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                </div>

                <!-- Application Controls -->
                <div class="space-y-4 pt-4">
                    <div class="flex items-center gap-4">
                        <button
                            class="flex items-center gap-2 px-4 py-2 bg-red hover:bg-maroon transition-all duration-200 rounded-md text-base {resetConfirmationState ===
                            1
                                ? 'animate-shake-mild'
                                : resetConfirmationState === 2
                                  ? 'animate-shake-strong'
                                  : ''}"
                            onclick={handleResetClick}
                            style="transform-origin: center;"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                            <span>
                                {#if resetConfirmationState === 0}
                                    Reset Application
                                {:else if resetConfirmationState === 1}
                                    Are you sure?
                                {:else}
                                    ARE YOU REALLY SURE?
                                {/if}
                            </span>
                        </button>
                    </div>

                    <div class="flex items-center gap-4">
                        <button
                            class="flex items-center gap-2 px-4 py-2 bg-blue hover:bg-sapphire transition-colors duration-200 rounded-md text-base"
                            onclick={() => {
                                downloadDBasJSON();
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            Download Data
                        </button>

                        <div class="relative">
                            <input
                                type="file"
                                id="file-input"
                                accept=".json"
                                onchange={handleFileUpload}
                                class="hidden"
                            />
                            <label
                                for="file-input"
                                class="flex items-center gap-2 px-4 py-2 bg-blue hover:bg-sapphire transition-colors duration-200 rounded-md text-base cursor-pointer"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <path
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L12 4m4 4v12"
                                    />
                                </svg>
                                Upload Data
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resume Template Editor -->
            <div class="space-y-4">
                <h2
                    class="text-lg font-medium text-text mb-4 flex items-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                        />
                    </svg>
                    Resume Template
                </h2>
                <button
                    class="w-full bg-blue hover:bg-sapphire transition-all duration-200 px-4 py-2 rounded-md text-base flex items-center justify-center gap-2"
                    onclick={fetchResTemplate}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    Fetch Resume Template
                </button>
                <div
                    class="h-[calc(100vh-24rem)] w-full rounded-lg overflow-hidden border border-surface0"
                >
                    {#if carta2}
                        <MarkdownEditor
                            carta={carta2}
                            bind:value={$resumeTemplate}
                            mode="tabs"
                            theme="settings"
                        />
                    {/if}
                </div>

                <!-- Knowledge Base -->
                 <h2
                    class="text-lg font-medium text-text mb-4 flex items-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                        />
                    </svg>
                    Resume Template
                </h2>
                <button
                    class="w-full bg-blue hover:bg-sapphire transition-all duration-200 px-4 py-2 rounded-md text-base flex items-center justify-center gap-2"
                    onclick={fetchKnowledgeBase}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    Fetch Sample Knowledge Base
                </button>
                <div>
                    This is going to be all the knowlege passed into the llm when tuning your resume.
                </div>
                <div
                    class="h-[calc(100vh-24rem)] w-full rounded-lg overflow-hidden border border-surface0"
                >
                    <textarea class="w-full h-80 overflow-y-scroll bg-mantle p-2" bind:value={$knowlegeBase}>
                        hi
                    </textarea>
                </div>
            </div>
        </div>
    </div>
</div>
