<script lang="ts">
    import "./editor.css";
    import { Carta, MarkdownEditor} from "carta-md";
    import { jsPDF } from "jspdf";
    import { content } from "$utils";

    let carta = new Carta({
            sanitizer: false,
            theme: "catppuccin-mocha"
            
    });
    $inspect(carta);
    $effect(() => {
        content.html = carta.render(content.md);
    });
    $inspect(content.html);
    const doc = new jsPDF();
    async function renderToPdf(html: string) {
        // Create a temporary element to hold the HTML
        // const tempElement = document.createElement('div');
        // tempElement.innerHTML = html;
        // document.body.appendChild(tempElement);
    
        // Convert to PDF
        doc.html(
            html
        );
        doc.save('document.pdf');
    }
</script>
<div class="w-full h-full">    
    <MarkdownEditor {carta} bind:value={content.md} mode="tabs" />
</div>