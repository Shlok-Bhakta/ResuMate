<script lang="ts">
    import "./editor.css";
    import { Carta, MarkdownEditor} from "carta-md";
    import { jsPDF } from "jspdf";
    import { resumeMd, resumeHtml, score, jobDescription, keywords, saveCurrentProject, header, editorShortcuts, tableify} from "$utils";
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
    
    $effect(() => {
        
        $resumeHtml = carta.render($header + tableify($resumeMd));
        // this stops the expensive score function from running every time the editor updates
        // it only runs when the user is idle for 3 seconds
        if (scoreTimeout !== null) {
            clearTimeout(scoreTimeout);
        }
        if (saveTimeout !== null) {
            clearTimeout(saveTimeout);
        }
        scoreTimeout = setTimeout(() => {   
            score();
        }, 1000);
        saveTimeout = setTimeout(() => {
            saveCurrentProject();
        }, 10000);
    });
    $inspect($resumeHtml);
   
</script>
<div class="w-full h-full">    
    <MarkdownEditor {carta} bind:value={$resumeMd} mode="tabs" />
</div>

