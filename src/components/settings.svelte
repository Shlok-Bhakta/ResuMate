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
        downloadDBasJSON
    } from "$utils";
// import "./settingseditor.css";
    import { Carta, MarkdownEditor} from "carta-md";
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
    let carta2 = $state<any>(null);
    // Comment

    $effect(() => {
        carta2 = new Carta({
                sanitizer: false,
                theme: "catppuccin-mocha",
                extensions: [
                    editorShortcuts
                ]
        });
        return () => {
            
            carta2 = null;
            
        };
    });
    $effect(() => {
        // rebuild the header when any values change
        $name;
        $email;
        $enableEmail
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
    })

        function handleFileUpload(event: any) {
        console.log("file upload");
        console.log(event);
        if (!(event)) return;
        if (!(event.target)) return;
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                if(!(e.target)) return;
                if(!(e.target.result)) return;
                // const jsonContent = JSON.parse(e.target.result);
                if(typeof e.target.result !== "string") return;
                importIndexedDBs(e.target.result);
            } catch (error) {
                console.error("Error parsing JSON file:", error);
            }
        };
        reader.onerror = function(e) {
            console.error("Error reading file:", e);
        };
        reader.readAsText(file);
    }
</script>

<div class="w-full h-full absolute top-0 left-0 grid grid-cols-1">
    <div class="w-11/12 h-10/12 bg-base place-self-center">
        <div class="grid grid-cols-2">
            <button
                class="bg-red p-2 w-fit h-fit"
                onclick={() => {
                    $modalState = $modalState == "None" ? "Settings" : "None";
                }}>X</button
            >
            <h1 class="place-self-end px-4 text-xl">Settings</h1>
        </div>

        <div class="p-2 grid grid-cols-2">
            <!-- all the forms that need to be filled for good resume -->
            <div class="">
                <!-- name -->
                <div class="grid grid-cols-1 w-fit">
                    <label for="name" class="text-text">Name</label>
                    <div>
                        <!-- <input type="checkbox" bind:checked={$enableName} /> -->
                        <input
                            class="text-crust px-2 py-1 bg-subtext1 rounded-sm disabled:bg-overlay0"
                            bind:value={$name}
                        />
                    </div>
                </div>
                <!--email-->
                <div class="grid grid-cols-1 w-fit">
                    <div>
                        <label for="email" class="text-text">Email</label>
                    </div>
                    <div>
                        <input type="checkbox" bind:checked={$enableEmail} />
                        <input
                            class="text-crust px-2 py-1 bg-subtext1 rounded-sm disabled:bg-overlay0"
                            bind:value={$email}
                            disabled={!$enableEmail}
                        />
                    </div>
                </div>
                <!--phone-->
                <div class="grid grid-cols-1 w-fit">
                    <label for="phone" class="text-text">Phone</label>
                    <div>
                        <input type="checkbox" bind:checked={$enablePhone} />
                        <input
                            class="text-crust px-2 py-1 bg-subtext1 rounded-sm disabled:bg-overlay0"
                            bind:value={$phone}
                            disabled={!$enablePhone}
                        />
                    </div>
                </div>
                <!--website-->
                <div class="grid grid-cols-1 w-fit">
                    <label for="website" class="text-text">Website</label>
                    <div>
                        <input type="checkbox" bind:checked={$enableWebsite} />
                        <input
                            class="text-crust px-2 py-1 bg-subtext1 rounded-sm disabled:bg-overlay0"
                            bind:value={$website}
                            disabled={!$enableWebsite}
                        />
                    </div>
                </div>
                <!--linkedin-->
                <div class="grid grid-cols-1 w-fit">
                    <label for="linkedin" class="text-text">Linkedin</label>
                    <div>
                        <input type="checkbox" bind:checked={$enableLinkedin} />
                        <input
                            class="text-crust px-2 py-1 bg-subtext1 rounded-sm disabled:bg-overlay0"
                            bind:value={$linkedin}
                            disabled={!$enableLinkedin}
                        />
                    </div>
                </div>
                <!-- github -->
                <div class="grid grid-cols-1 w-fit">
                    <label for="github" class="text-text">Github</label>
                    <div>
                        <input type="checkbox" bind:checked={$enableGithub} />
                        <input
                            class="text-crust px-2 py-1 bg-subtext1 rounded-sm disabled:bg-overlay0"
                            bind:value={$github}
                            disabled={!$enableGithub}
                        />
                    </div>
                </div>
                <!-- address -->
                <div class="grid grid-cols-1 w-fit">
                    <label for="address" class="text-text">Address</label>
                    <div>
                        <input type="checkbox" bind:checked={$enableAddress} />
                        <input
                            class="text-crust px-2 py-1 bg-subtext1 rounded-sm disabled:bg-overlay0"
                            bind:value={$address}
                            disabled={!$enableAddress}
                        />
                    </div>
                </div>
                <div class="grid grid-cols-1 w-fit">
                    <label for="usCitizenship" class="text-text">US Citizenship</label>
                    <div>
                        <input type="checkbox" bind:checked={$showUSCitizenship} />
                    </div>
                </div>
                <div>
                    <label for="reset" class="text-text">Reset Application</label>
                    <button class="bg-red px-2 py-1 rounded-sm" onclick={resetApplication}>Reset</button>
                </div>
                <button class="text-mantle px-2 py-1 bg-blue rounded-sm" onclick={() => {downloadDBasJSON()}}>
                    download
                </button>
                <!-- file upload that runs importIndexedDBs with the string of the content as input-->
                <input type="file" id="file-input" accept=".json" onchange={handleFileUpload} />
            </div>

            <!-- The resume base template -->
            <div class="grid grid-cols-1 w-full grid-rows-[1fr_auto] ">
                <label for="resumeTemplate" class="text-text">Fetch Default Template</label>
                <button class="bg-blue px-2 py-1 rounded-sm" onclick={fetchResTemplate}>Fetch</button>

                <label for="resumeTemplate" class="text-text">Resume Template</label>
                <div>
                    <div class="w-full h-full">    
                        {#if carta2}
                            <MarkdownEditor carta={carta2} bind:value={$resumeTemplate} mode="tabs" />
                        {/if}
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
</div>

