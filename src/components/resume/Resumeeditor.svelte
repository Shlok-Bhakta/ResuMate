<script lang="ts">
    import "./editor.css";
    import { Carta, MarkdownEditor} from "carta-md";
    import { jsPDF } from "jspdf";
    import { resumeMd, resumeHtml, score, keywords , jobDescription} from "$utils";
    let carta = new Carta({
            sanitizer: false,
            theme: "catppuccin-mocha"
    });
    $inspect(carta);
    
    $effect(() => {
        $resumeHtml = carta.render($resumeMd);
    });
    $inspect($resumeHtml);
    
</script>
<div class="w-full h-full">    
    <MarkdownEditor {carta} bind:value={$resumeMd} mode="tabs" />
</div>

<button onclick={() => {score($resumeMd, $jobDescription, $keywords)}}>
    scor
</button>