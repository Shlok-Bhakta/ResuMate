<script lang="ts">
    import "./editor.css";
    import { Carta, MarkdownEditor} from "carta-md";
    import { resumeMd, resumeHtml, score, jobDescription, keywords, saveCurrentProject, header, editorShortcuts, tableify, saveState} from "$utils";
    let carta = new Carta({
            sanitizer: false,
            theme: "catppuccin-mocha",

            extensions: [
                editorShortcuts
            ]
    });
    $inspect(carta);
    
    let scoreTimeout: number | null = null;
    let saveTimeout: number | null = null;
    
    function updateSaveState() {
        $saveState = 0; // Pending state
    }

    $effect(() => {
        $jobDescription
        $resumeHtml = carta.render($header + tableify($resumeMd));
        updateSaveState();
        // this stops the expensive score function from running every time the editor updates
        // it only runs when the user is idle for 3 seconds
        if (scoreTimeout !== null) {
            // return;
            clearTimeout(scoreTimeout);
        }
        if (saveTimeout !== null) {
            // return;
            clearTimeout(saveTimeout);
        }
        scoreTimeout = setTimeout(() => {   
            score();
        }, 500);
        saveTimeout = setTimeout(() => {
            saveCurrentProject();
        }, 1000);
    });
   
</script>
<div class="w-full h-full">    
    <MarkdownEditor {carta} bind:value={$resumeMd} mode="tabs" theme="main" />
</div>
<style>
	:global(.carta-font-code) {
		font-family: monospace;
		font-size: 1.1rem;
		line-height: 1.1rem;
		letter-spacing: normal;
	}
</style>
