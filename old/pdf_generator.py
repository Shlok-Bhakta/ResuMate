import os
import subprocess

def generate_pdf_from_markdown(markdown_content, temp_dir):
    """
    Generate a PDF file from markdown content.
    
    Args:
        markdown_content: The markdown text
        temp_dir: Directory to store temporary files
        
    Returns:
        Path to the generated PDF or None if failed
    """
    try:
        # Create temp directory if it doesn't exist
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save markdown content to file
        md_path = os.path.join(temp_dir, "resume.md")
        with open(md_path, 'w') as f:
            f.write(markdown_content)
        
        # Check if style.css exists, create default if not
        if not os.path.exists("style.css"):
            create_default_style_css()
        
        # Generate PDF using Pandoc
        pdf_path = os.path.join(temp_dir, "resume.pdf")
        cmd = ["pandoc", md_path, "-o", pdf_path, "--pdf-engine=weasyprint", "--css", "style.css"]
        
        subprocess.run(cmd, check=True)
        
        return pdf_path if os.path.exists(pdf_path) else None
    
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return None

def create_default_style_css():
    """Create a default style.css file if it doesn't exist"""
    with open("style.css", "w") as f:
        f.write("""
        body {
            font-family: 'Arial', sans-serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3 {
            color: #2a7ae2;
        }
        a {
            color: #2a7ae2;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        """)