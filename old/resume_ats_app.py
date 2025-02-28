import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import customtkinter as ctk
import markdown
import requests
from bs4 import BeautifulSoup
import threading
import subprocess
import os
import tempfile
from PIL import Image, ImageTk
import io
import sys
import json
import time
from simple_ats import ATS
from pdf2image import convert_from_path

# Set appearance mode and theme - Catppuccin inspired
CATPPUCCIN_COLORS = {
    "bg": "#1E1E2E",       # Base
    "fg": "#CDD6F4",       # Text
    "accent": "#F5C2E7",   # Pink
    "button": "#89B4FA",   # Blue
    "button_text": "#11111B", # Crust
    "hover": "#74C7EC",    # Sky
    "border": "#313244",   # Surface0
    "highlight": "#F38BA8", # Red
    "success": "#A6E3A1"   # Green
}

class ResumeATSApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Configure window
        self.title("Resume ATS Optimizer")
        self.geometry("1200x800")
        ctk.set_appearance_mode("dark")
        
        # Fix Wayland transparency issues
        self.attributes("-type", "normal")
        self.configure(background=CATPPUCCIN_COLORS["bg"])
        
        # Initialize variables
        self.current_md = ""
        self.current_job_desc = ""
        self.current_score = 0
        self.resume_path = None
        self.job_desc_path = None
        self.temp_dir = tempfile.mkdtemp()
        os.makedirs(os.path.join(self.temp_dir, "temp"), exist_ok=True)
        os.makedirs(os.path.join(self.temp_dir, "temp/max"), exist_ok=True)
        self.score_chain = [0]
        self.highest_score = 0
        self.highest_score_latex = ""
        self.current_project_dir = None  # Add this line
        
        # Ensure API keys are available
        if not os.getenv("OPENROUTER_API_KEY"):
            messagebox.showerror("API Key Missing", "OPENROUTER_API_KEY environment variable not set")
        
        # Create UI
        self.create_ui()
        
    def create_ui(self):
        # Create main container with 2 panes
        self.main_panes = ttk.PanedWindow(self, orient="horizontal")
        self.main_panes.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Left pane (Resume editor)
        self.left_frame = ctk.CTkFrame(self.main_panes)
        self.main_panes.add(self.left_frame, weight=1)
        
        # Tab view for MD and PDF
        self.tab_view = ctk.CTkTabview(self.left_frame)
        self.tab_view.pack(fill="both", expand=True, padx=5, pady=5)
        
        # MD tab
        self.md_tab = self.tab_view.add("Markdown")
        self.md_editor = scrolledtext.ScrolledText(self.md_tab, wrap=tk.WORD, 
                                                 bg=CATPPUCCIN_COLORS["bg"], 
                                                 fg=CATPPUCCIN_COLORS["fg"],
                                                 insertbackground=CATPPUCCIN_COLORS["accent"])
        self.md_editor.pack(fill="both", expand=True)
        
        # PDF tab
        self.pdf_tab = self.tab_view.add("Preview")
        
        # Create a Canvas with Scrollbars for PDF viewer
        self.pdf_frame = ctk.CTkFrame(self.pdf_tab)
        self.pdf_frame.pack(fill="both", expand=True)
        
        # Add scrollbars
        self.pdf_vscrollbar = ttk.Scrollbar(self.pdf_frame, orient="vertical")
        self.pdf_vscrollbar.pack(side="right", fill="y")
        
        self.pdf_hscrollbar = ttk.Scrollbar(self.pdf_frame, orient="horizontal")
        self.pdf_hscrollbar.pack(side="bottom", fill="x")
        
        # Canvas for PDF rendering
        self.pdf_canvas = tk.Canvas(
            self.pdf_frame, 
            bg=CATPPUCCIN_COLORS["bg"],
            highlightthickness=0,
            yscrollcommand=self.pdf_vscrollbar.set,
            xscrollcommand=self.pdf_hscrollbar.set
        )
        self.pdf_canvas.pack(side="left", fill="both", expand=True)
        
        # Connect scrollbars to canvas
        self.pdf_vscrollbar.config(command=self.pdf_canvas.yview)
        self.pdf_hscrollbar.config(command=self.pdf_canvas.xview)
        
        # Buttons for MD actions
        self.md_buttons_frame = ctk.CTkFrame(self.left_frame)
        self.md_buttons_frame.pack(fill="x", padx=5, pady=5)
        self.load_md_btn = ctk.CTkButton(self.md_buttons_frame, text="Load MD",
                                        command=self.load_md,
                                        fg_color=CATPPUCCIN_COLORS["button"],
                                        text_color=CATPPUCCIN_COLORS["button_text"],
                                        hover_color=CATPPUCCIN_COLORS["hover"])
        self.load_md_btn.pack(side="left", padx=5, pady=5)
        
        self.save_md_btn = ctk.CTkButton(self.md_buttons_frame, text="Save MD",
                                         command=self.save_md,
                                         fg_color=CATPPUCCIN_COLORS["button"],
                                         text_color=CATPPUCCIN_COLORS["button_text"],
                                         hover_color=CATPPUCCIN_COLORS["hover"])
        self.save_md_btn.pack(side="left", padx=5, pady=5)
        self.generate_pdf_btn = ctk.CTkButton(self.md_buttons_frame, text="Generate PDF",
                                              command=self.generate_pdf,
                                              fg_color=CATPPUCCIN_COLORS["button"],
                                              text_color=CATPPUCCIN_COLORS["button_text"],
                                              hover_color=CATPPUCCIN_COLORS["hover"])
        self.generate_pdf_btn.pack(side="left", padx=5, pady=5)
        
        # Right pane (Job description and optimization)
        self.right_frame = ctk.CTkFrame(self.main_panes)
        self.main_panes.add(self.right_frame, weight=1)
        
        # Job description section
        self.job_desc_label = ctk.CTkLabel(self.right_frame, text="Job Description:")
        self.job_desc_label.pack(anchor="w", padx=5, pady=5)
        
        # URL input for job description
        self.url_frame = ctk.CTkFrame(self.right_frame)
        self.url_frame.pack(fill="x", padx=5, pady=5)
        
        self.url_label = ctk.CTkLabel(self.url_frame, text="URL:")
        self.url_label.pack(side="left", padx=5)
        
        self.url_entry = ctk.CTkEntry(self.url_frame, width=300)
        self.url_entry.pack(side="left", padx=5, expand=True, fill="x")
        
        self.fetch_btn = ctk.CTkButton(self.url_frame, text="Fetch",
                                      command=self.fetch_job_description,
                                      fg_color=CATPPUCCIN_COLORS["button"],
                                      text_color=CATPPUCCIN_COLORS["button_text"],
                                      hover_color=CATPPUCCIN_COLORS["hover"])
        self.fetch_btn.pack(side="left", padx=5)
        
        # Job description text area
        self.job_desc_text = scrolledtext.ScrolledText(self.right_frame, wrap=tk.WORD, 
                                                     bg=CATPPUCCIN_COLORS["bg"], 
                                                     fg=CATPPUCCIN_COLORS["fg"],
                                                     insertbackground=CATPPUCCIN_COLORS["accent"], 
                                                     height=15)
        self.job_desc_text.pack(fill="x", expand=False, padx=5, pady=5)
        
        # Score and optimization section
        self.score_frame = ctk.CTkFrame(self.right_frame)
        self.score_frame.pack(fill="x", padx=5, pady=10)
        
        self.score_label = ctk.CTkLabel(self.score_frame, text="Current Score:")
        self.score_label.pack(side="left", padx=5)
        
        self.score_value = ctk.CTkLabel(self.score_frame, text="0%", font=("Arial", 16, "bold"))
        self.score_value.pack(side="left", padx=5)
        
        # Optimization buttons
        self.optimize_btn = ctk.CTkButton(self.right_frame, text="Score Resume",
                                         command=self.score_resume,
                                         fg_color=CATPPUCCIN_COLORS["button"],
                                         text_color=CATPPUCCIN_COLORS["button_text"],
                                         hover_color=CATPPUCCIN_COLORS["hover"])
        self.optimize_btn.pack(fill="x", padx=5, pady=5)
        
        self.auto_optimize_btn = ctk.CTkButton(self.right_frame, text="Auto-Optimize Resume",
                                              command=self.auto_optimize,
                                              fg_color=CATPPUCCIN_COLORS["button"],
                                              text_color=CATPPUCCIN_COLORS["button_text"],
                                              hover_color=CATPPUCCIN_COLORS["hover"])
        self.auto_optimize_btn.pack(fill="x", padx=5, pady=5)
        
        # Project Save Buttons
        self.project_frame = ctk.CTkFrame(self.right_frame)
        self.project_frame.pack(fill="x", padx=5, pady=5)
        
        self.company_label = ctk.CTkLabel(self.project_frame, text="Company:")
        self.company_label.pack(side="left", padx=5, pady=5)
        
        self.company_entry = ctk.CTkEntry(self.project_frame, width=200)
        self.company_entry.pack(side="left", padx=5, pady=5, expand=True, fill="x")
        
        self.save_project_btn = ctk.CTkButton(self.project_frame, text="Save Project",
                                            command=self.save_project,
                                            fg_color=CATPPUCCIN_COLORS["button"],
                                            text_color=CATPPUCCIN_COLORS["button_text"],
                                            hover_color=CATPPUCCIN_COLORS["hover"])
        self.save_project_btn.pack(side="left", padx=5, pady=5)
        
        self.load_project_btn = ctk.CTkButton(self.project_frame, text="Load Project",
                                            command=self.load_project,
                                            fg_color=CATPPUCCIN_COLORS["button"],
                                            text_color=CATPPUCCIN_COLORS["button_text"],
                                            hover_color=CATPPUCCIN_COLORS["hover"])
        self.load_project_btn.pack(side="left", padx=5, pady=5)
        
        # Project info display
        self.project_info_label = ctk.CTkLabel(self.right_frame, text="Current Project: None")
        self.project_info_label.pack(anchor="w", padx=5)

        # Optimization log
        self.log_label = ctk.CTkLabel(self.right_frame, text="Optimization Log:")
        self.log_label.pack(anchor="w", padx=5, pady=5)
        
        self.log_text = scrolledtext.ScrolledText(self.right_frame, wrap=tk.WORD, 
                                               bg=CATPPUCCIN_COLORS["bg"], 
                                               fg=CATPPUCCIN_COLORS["fg"],
                                               insertbackground=CATPPUCCIN_COLORS["accent"], 
                                               height=15)
        self.log_text.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Create knowledge.md if it doesn't exist
        if not os.path.exists("knowlege.md"):
            with open("knowlege.md", "w") as f:
                f.write("# Knowledge Bank\n\nAdd your experiences and skills here.\n")
            self.log("Created empty knowledge.md file")

        # Create CSS file if it doesn't exist
        if not os.path.exists("style.css"):
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
            self.log("Created default style.css file")

    def save_project(self):
        company_name = self.company_entry.get().strip()
        if not company_name:
            self.log("Please enter a company name")
            return
        
        # Create projects directory if it doesn't exist
        os.makedirs("projects", exist_ok=True)
        
        # Create company-specific directory (replace spaces with underscores)
        safe_company_name = company_name.replace(" ", "_").replace("/", "_").replace("\\", "_")
        project_dir = os.path.join("projects", safe_company_name)
        
        # Check if project exists
        if os.path.exists(project_dir):
            # Ask for confirmation before overwriting
            if not messagebox.askyesno("Project exists", 
                                    f"Project for {company_name} already exists. Overwrite?"):
                return
        
        # Create project directory
        os.makedirs(project_dir, exist_ok=True)
        
        try:
            # Save resume markdown
            resume_content = self.md_editor.get(1.0, tk.END)
            with open(os.path.join(project_dir, "resume.md"), "w") as f:
                f.write(resume_content)
            
            # Save job description
            job_desc = self.job_desc_text.get(1.0, tk.END)
            with open(os.path.join(project_dir, "job_description.md"), "w") as f:
                f.write(job_desc)
            
            # Save job URL
            with open(os.path.join(project_dir, "job_url.txt"), "w") as f:
                f.write(self.url_entry.get())
            
            # Save logs
            log_content = self.log_text.get(1.0, tk.END)
            with open(os.path.join(project_dir, "logs.txt"), "w") as f:
                f.write(log_content)
            
            # Save score history
            with open(os.path.join(project_dir, "score_history.json"), "w") as f:
                json.dump({
                    "current_score": self.current_score,
                    "highest_score": self.highest_score,
                    "score_chain": self.score_chain
                }, f)
            
            # Save project metadata
            project_meta = {
                "company_name": company_name,
                "date_created": time.strftime("%Y-%m-%d %H:%M:%S"),
                "date_modified": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            with open(os.path.join(project_dir, "project_meta.json"), "w") as f:
                json.dump(project_meta, f)
            
            # If we have a PDF, save it too
            pdf_path = os.path.join(self.temp_dir, "resume.pdf")
            if os.path.exists(pdf_path):
                import shutil
                shutil.copy(pdf_path, os.path.join(project_dir, "resume.pdf"))
            
            # Update current project info
            self.current_project_dir = project_dir
            self.project_info_label.configure(text=f"Current Project: {company_name}")
            
            self.log(f"Project saved: {company_name}")
            messagebox.showinfo("Project Saved", f"Project for {company_name} saved successfully")
            
        except Exception as e:
            self.log(f"Error saving project: {e}")
            messagebox.showerror("Error", f"Failed to save project: {e}")

    def load_project(self):
        # Get list of projects
        if not os.path.exists("projects"):
            os.makedirs("projects", exist_ok=True)
            messagebox.showinfo("No Projects", "No projects directory found. Created projects directory.")
            return
        
        project_dirs = [d for d in os.listdir("projects") 
                    if os.path.isdir(os.path.join("projects", d))]
        
        if not project_dirs:
            messagebox.showinfo("No Projects", "No projects found")
            return
        
        # Create a simple dialog to select project
        select_dialog = ctk.CTkToplevel(self)
        select_dialog.title("Select Project")
        select_dialog.geometry("400x300")
        # select_dialog.transient(self)
        # Don't grab_set() here, we'll do it at the end
        
        # Project list
        projects_listbox = tk.Listbox(select_dialog, bg=CATPPUCCIN_COLORS["bg"], 
                                    fg=CATPPUCCIN_COLORS["fg"], selectbackground=CATPPUCCIN_COLORS["accent"])
        projects_listbox.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Populate list
        project_display_names = []
        for dir_name in project_dirs:
            # Try to get proper company name from metadata
            meta_path = os.path.join("projects", dir_name, "project_meta.json")
            if os.path.exists(meta_path):
                try:
                    with open(meta_path, "r") as f:
                        meta = json.load(f)
                        display_name = f"{meta['company_name']} (Created: {meta['date_created']})"
                except:
                    display_name = dir_name.replace("_", " ")
            else:
                display_name = dir_name.replace("_", " ")
            
            project_display_names.append((display_name, dir_name))
            projects_listbox.insert(tk.END, display_name)
        
        # Buttons
        buttons_frame = ctk.CTkFrame(select_dialog)
        buttons_frame.pack(fill="x", padx=10, pady=10)
        
        def on_select():
            if not projects_listbox.curselection():
                return
            
            selected_idx = projects_listbox.curselection()[0]
            _, dir_name = project_display_names[selected_idx]
            project_dir = os.path.join("projects", dir_name)
            
            try:
                # Load resume
                resume_path = os.path.join(project_dir, "resume.md")
                if os.path.exists(resume_path):
                    with open(resume_path, "r") as f:
                        content = f.read()
                        self.md_editor.delete(1.0, tk.END)
                        self.md_editor.insert(tk.END, content)
                
                # Load job description
                job_desc_path = os.path.join(project_dir, "job_description.md")
                if os.path.exists(job_desc_path):
                    with open(job_desc_path, "r") as f:
                        content = f.read()
                        self.job_desc_text.delete(1.0, tk.END)
                        self.job_desc_text.insert(tk.END, content)
                
                # Load URL
                url_path = os.path.join(project_dir, "job_url.txt")
                if os.path.exists(url_path):
                    with open(url_path, "r") as f:
                        content = f.read().strip()
                        self.url_entry.delete(0, tk.END)
                        self.url_entry.insert(0, content)
                
                # Load logs
                log_path = os.path.join(project_dir, "logs.txt")
                if os.path.exists(log_path):
                    with open(log_path, "r") as f:
                        content = f.read()
                        self.log_text.delete(1.0, tk.END)
                        self.log_text.insert(tk.END, content)
                
                # Load score history
                score_path = os.path.join(project_dir, "score_history.json")
                if os.path.exists(score_path):
                    with open(score_path, "r") as f:
                        scores = json.load(f)
                        self.current_score = scores.get("current_score", 0)
                        self.highest_score = scores.get("highest_score", 0)
                        self.score_chain = scores.get("score_chain", [0])
                        self.score_value.configure(text=f"{self.current_score}%")
                
                # Load project metadata
                meta_path = os.path.join(project_dir, "project_meta.json")
                if os.path.exists(meta_path):
                    with open(meta_path, "r") as f:
                        meta = json.load(f)
                        company_name = meta.get("company_name", dir_name.replace("_", " "))
                        self.company_entry.delete(0, tk.END)
                        self.company_entry.insert(0, company_name)
                        self.project_info_label.configure(text=f"Current Project: {company_name}")
                
                # Set current project
                self.current_project_dir = project_dir
                
                # Generate PDF preview
                self.generate_pdf()
                
                self.log(f"Project loaded: {dir_name.replace('_', ' ')}")
                select_dialog.destroy()
                
            except Exception as e:
                self.log(f"Error loading project: {e}")
                messagebox.showerror("Error", f"Failed to load project: {e}")
        
        select_btn = ctk.CTkButton(buttons_frame, text="Load Selected Project",
                                command=on_select,
                                fg_color=CATPPUCCIN_COLORS["button"],
                                text_color=CATPPUCCIN_COLORS["button_text"],
                                hover_color=CATPPUCCIN_COLORS["hover"])
        select_btn.pack(side="left", padx=5, pady=5, expand=True)
        cancel_btn = ctk.CTkButton(buttons_frame, text="Cancel",
                                command=select_dialog.destroy,
                                fg_color=CATPPUCCIN_COLORS["border"],
                                text_color=CATPPUCCIN_COLORS["fg"],
                                hover_color=CATPPUCCIN_COLORS["border"])
        cancel_btn.pack(side="left", padx=5, pady=5, expand=True)
        
        # Make dialog visible after all widgets are created and packed
        select_dialog.update()
        
        # Center the dialog relative to main window
        x = self.winfo_rootx() + (self.winfo_width() // 2) - (400 // 2)
        y = self.winfo_rooty() + (self.winfo_height() // 2) - (300 // 2)
        select_dialog.geometry(f"400x300+{x}+{y}")
        
        # Make the dialog visible
        select_dialog.deiconify()
        
        # Force update to ensure the window is fully drawn
        select_dialog.update_idletasks()
        
        # Try to make it modal after it's fully visible
        self.after(100, lambda: self._make_dialog_modal(select_dialog))

    def load_md(self):
        if not self.current_project_dir:
            messagebox.showinfo("No Project", "Please create or load a project first")
            self.load_project()  # Prompt to load a project
            return
            
        file_path = filedialog.askopenfilename(filetypes=[("Markdown files", "*.md")])
        if file_path:
            with open(file_path, 'r') as f:
                content = f.read()
                self.md_editor.delete(1.0, tk.END)
                self.md_editor.insert(tk.END, content)
            self.resume_path = file_path
            self.log("Loaded resume from: " + file_path)
    
    def save_md(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".md", filetypes=[("Markdown files", "*.md")])
        if file_path:
            content = self.md_editor.get(1.0, tk.END)
            with open(file_path, 'w') as f:
                f.write(content)
            self.resume_path = file_path
            self.log("Saved resume to: " + file_path)
    
    def generate_pdf(self):
        content = self.md_editor.get(1.0, tk.END)
        
        # Save MD content to file
        md_path = os.path.join(self.temp_dir, "resume.md")
        with open(md_path, 'w') as f:
            f.write(content)
        
        # Generate PDF using Pandoc
        pdf_path = os.path.join(self.temp_dir, "resume.pdf")
        cmd = ["pandoc", md_path, "-o", pdf_path, "--pdf-engine=weasyprint", "--css", "style.css"]
        
        try:
            subprocess.run(cmd, check=True)
            self.display_pdf(pdf_path)
            self.log("PDF generated successfully")
        except subprocess.CalledProcessError as e:
            self.log(f"Error generating PDF: {e}")
    
    def display_pdf(self, pdf_path):
        try:
            # Clear existing content
            self.pdf_canvas.delete("all")
            
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=150)
            
            # Store PhotoImage objects to prevent garbage collection
            self.photo_images = []
            total_height = 0
            
            # Get the height of the container
            container_height = self.pdf_frame.winfo_height()
            if container_height <= 1:  # Not yet realized
                container_height = 800  # Default fallback height
                
            # Display each page with vertical spacing
            spacing = 20
            available_height = container_height - (len(images) - 1) * spacing
            page_height = available_height // len(images)
            
            for img in images:
                # Calculate scaling to fit page height
                img_width, img_height = img.size
                scale_factor = page_height / img_height
                new_height = page_height
                new_width = int(img_width * scale_factor)
                
                # Resize image to fit container height
                resized_img = img.resize((new_width, new_height), Image.LANCZOS)
                
                photo = ImageTk.PhotoImage(resized_img)
                self.photo_images.append(photo)
                
                # Center the image horizontally
                x_position = max(new_width // 2, 300)  # At least 300px from left
                
                # Place image on canvas
                self.pdf_canvas.create_image(x_position, total_height, anchor=tk.N, image=photo)
                total_height += new_height + spacing
            
            # Update canvas scrollregion - make it wider than the widest image to allow centering
            max_width = max(photo.width() for photo in self.photo_images) * 2
            self.pdf_canvas.config(scrollregion=(0, 0, max_width, total_height))
            
        except ImportError:
            self.log("Error: pdf2image module required. Install with: pip install pdf2image")
            self.pdf_canvas.create_text(
                300, 200, 
                text="Please install pdf2image: pip install pdf2image\n\n"
                    "Note: This also requires poppler-utils:\n"
                    "- Ubuntu/Debian: sudo apt-get install poppler-utils\n"
                    "- macOS: brew install poppler\n"
                    "- Windows: See pdf2image documentation",
                fill=CATPPUCCIN_COLORS["fg"], width=500
            )
        except Exception as e:
            self.log(f"Error displaying PDF: {e}")
    
    def fetch_job_description(self):
        url = self.url_entry.get()
        if not url:
            self.log("Please enter a URL")
            return
            
        self.log(f"Fetching job description from {url}...")
        
        def fetch():
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract job description - first try common containers
                    job_desc_containers = soup.select(".job-description, .description, [data-automation='jobDescription']")
                    
                    if job_desc_containers:
                        text = job_desc_containers[0].get_text(separator="\n", strip=True)
                    else:
                        # Fallback: get all text and try to clean it up
                        text = soup.get_text(separator="\n", strip=True)
                    
                    # Update UI in the main thread
                    self.after(0, lambda: self.job_desc_text.delete(1.0, tk.END))
                    self.after(0, lambda: self.job_desc_text.insert(tk.END, text))
                    self.after(0, lambda: self.log("Job description fetched successfully"))
                else:
                    self.after(0, lambda: self.log(f"Failed to fetch job description. Status code: {response.status_code}"))
            except Exception as e:
                self.after(0, lambda: self.log(f"Error fetching job description: {e}"))
        
        # Run in a separate thread to keep UI responsive
        thread = threading.Thread(target=fetch)
        thread.daemon = True
        thread.start()
    
    def score_resume(self):
        # Get content from editors
        md_content = self.md_editor.get(1.0, tk.END)
        job_desc = self.job_desc_text.get(1.0, tk.END)
        
        if not md_content.strip() or not job_desc.strip():
            self.log("Please provide both resume content and job description")
            return
            
        # Save files to temp directory
        md_path = os.path.join(self.temp_dir, "resume.md")
        with open(md_path, 'w') as f:
            f.write(md_content)
            
        job_desc_path = os.path.join(self.temp_dir, "jobdesc.md")
        with open(job_desc_path, 'w') as f:
            f.write(job_desc)
            
        # Generate PDF
        pdf_path = os.path.join(self.temp_dir, "resume.pdf")
        cmd = ["pandoc", md_path, "-o", pdf_path, "--pdf-engine=weasyprint", "--css", "style.css"]
        
        try:
            self.log("Generating PDF...")
            subprocess.run(cmd, check=True)
            
            # Extract text from PDF
            subprocess.call(["pdftotext", pdf_path])
            
            # Read text content
            with open(os.path.join(self.temp_dir, "resume.txt"), "r") as f:
                resume_content = f.read()
                
            # Score with ATS
            ats = ATS()
            ats.load_resume(resume_content)
            ats.load_job_description(job_desc)
            ats.clean_jd()
            
            experience = ats.extract_experience()
            ats.clean_experience(experience)
            
            skills = " ".join(ats.extract_skills())
            ats.clean_skills(skills)
            
            similarity_score = ats.calculate_detailed_score()
            score = round(similarity_score["overall_score"] * 100, 2)
            # score = similarity_score["overall_score"]
            print(similarity_score)

            # Update score display
            self.score_value.configure(text=f"{score}%")
            self.current_score = score
            
            # Update score history
            if not self.score_chain or self.score_chain[-1] != score:
                self.score_chain.append(score)
            
            # Update highest score
            if score > self.highest_score:
                self.highest_score = score
                self.highest_score_latex = md_content
                with open(os.path.join(self.temp_dir, "temp/max/resume.md"), "w") as f:
                    f.write(md_content)
                    
                self.log(f"New highest score: {score}%")
            
            # Log result
            self.log(f"Resume ATS score: {score}%")
            
            # Display PDF
            self.display_pdf(pdf_path)
            
        except Exception as e:
            self.log(f"Error scoring resume: {e}")
    
    def auto_optimize(self):
        # Get content from editors
        md_content = self.md_editor.get(1.0, tk.END)
        job_desc = self.job_desc_text.get(1.0, tk.END)
        
        if not md_content.strip() or not job_desc.strip():
            self.log("Please provide both resume content and job description")
            return
        
        # First score the current resume    
        self.score_resume()
        
        # Now start optimization thread
        self.log("Starting auto-optimization process...")
        
        def optimize_thread():
            try:
                # Save job description
                with open(os.path.join(self.temp_dir, "jobdesc.md"), "w") as f:
                    f.write(job_desc)

                # Prepare command to run atsemu.py
                cmd = [sys.executable, "atsemu.py", self.temp_dir]
                
                # Run the optimization process
                self.log("Running atsemu.py optimization... (this will take several minutes)")
                process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
                
                # Stream output to log
                for line in process.stdout:
                    self.after(0, lambda l=line: self.log(l.strip()))
                
                process.wait()
                
                # Check if optimization completed successfully
                if process.returncode == 0:
                    self.log("Optimization completed successfully")
                    
                    # Load the optimized resume if available
                    max_resume_path = os.path.join(self.temp_dir, "temp/max/resume.md")
                    if os.path.exists(max_resume_path):
                        with open(max_resume_path, "r") as f:
                            optimized_content = f.read()
                            self.after(0, lambda: self.md_editor.delete(1.0, tk.END))
                            self.after(0, lambda: self.md_editor.insert(tk.END, optimized_content))
                        
                        # Generate and display PDF
                        self.after(0, self.generate_pdf)
                        
                        # Update score
                        self.after(0, self.score_resume)
                    else:
                        self.log("Optimized resume not found")
                else:
                    self.log(f"Optimization failed with return code {process.returncode}")
            
            except Exception as e:
                self.after(0, lambda: self.log(f"Optimization error: {e}"))
        
        # Run in a separate thread
        thread = threading.Thread(target=optimize_thread)
    def _make_dialog_modal(self, dialog):
        """Helper method to safely make a dialog modal after it's visible"""
        try:
            if dialog.winfo_exists() and dialog.winfo_viewable():
                dialog.grab_set()
            else:
                self.log("Dialog not viewable, skipping modal behavior")
        except Exception as e:
            self.log(f"Warning: Could not make dialog modal: {e}")
    
    def log(self, message):
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)  # Auto-scroll to bottom
    def log(self, message):
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)  # Auto-scroll to bottom

if __name__ == "__main__":
    app = ResumeATSApp()
    app.mainloop()