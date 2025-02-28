import streamlit as st
import os
import tempfile
from pathlib import Path
import pandas as pd
import time
import base64

from ats_processor import score_resume
from pdf_generator import generate_pdf_from_markdown
from project_manager import save_project, load_project, get_project_list
from utils import fetch_job_description_from_url, setup_temp_dir
# from streamlit_ace import st_ace
from code_editor import code_editor
# Page configuration
st.set_page_config(
    page_title="Resume ATS Optimizer",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if "temp_dir" not in st.session_state:
    st.session_state.temp_dir = setup_temp_dir()
    
if "current_project" not in st.session_state:
    st.session_state.current_project = None
    
if "resume_content" not in st.session_state:
    st.session_state.resume_content = ""
    
if "job_desc" not in st.session_state:
    st.session_state.job_desc = ""
    
if "current_score" not in st.session_state:
    st.session_state.current_score = 0
    
if "highest_score" not in st.session_state:
    st.session_state.highest_score = 0
    
if "score_history" not in st.session_state:
    st.session_state.score_history = [0]
    
if "pdf_path" not in st.session_state:
    st.session_state.pdf_path = None
    
if "log_messages" not in st.session_state:
    st.session_state.log_messages = []

# Helper function to log messages
def log_message(message):
    timestamp = time.strftime("%H:%M:%S")
    st.session_state.log_messages.append(f"[{timestamp}] {message}")

# Main title
st.title("Resume ATS Optimizer")

# Create sidebar for project management
with st.sidebar:
    st.header("Project Management")
    
    # Project selection
    project_list = get_project_list()
    if project_list:
        selected_project = st.selectbox("Select Project", ["None"] + project_list)
        if selected_project != "None" and st.button("Load Project"):
            success, message, data = load_project(selected_project)
            if success:
                st.session_state.resume_content = data.get("resume", "")
                st.session_state.job_desc = data.get("job_desc", "")
                st.session_state.current_score = data.get("current_score", 0)
                st.session_state.highest_score = data.get("highest_score", 0)
                st.session_state.current_project = selected_project
                log_message(f"Loaded project: {selected_project}")
                st.success(f"Project '{selected_project}' loaded successfully")
            else:
                st.error(message)
    
    # Save project
    st.subheader("Save Project")

    company_name = st.text_input("Company Name")
    if st.session_state.current_project:
        company_name = st.session_state.current_project
    # Display current project
    st.info(f"Current Project: {st.session_state.current_project or 'None'}")
    
    if st.button("Save Project") and company_name:
        project_data = {
            "resume": st.session_state.resume_content,
            "job_desc": st.session_state.job_desc,
            "current_score": st.session_state.current_score,
            "highest_score": st.session_state.highest_score,
            "score_history": st.session_state.score_history
        }
        success, message = save_project(company_name, project_data)
        if success:
            st.session_state.current_project = company_name
            log_message(f"Project saved: {company_name}")
            st.success(message)
        else:
            st.error(message)
    

# Create main layout with two columns
col1, col2 = st.columns([5, 5])

# Left column - Resume editor and PDF preview
with col1:
    st.header("Resume Editor")
    
    # Tabs for markdown and preview
    tab1, tab2 = st.tabs(["Markdown Editor", "PDF Preview"])
    
    with tab1:
        # Generate a unique key for the editor if content changes
        editor_key = f"resume_md_editor_{hash(st.session_state.resume_content)[:10] if hasattr(hash(st.session_state.resume_content), '__getitem__') else 'default'}"
        
        # Show editor with dynamic key to force refresh when content changes
        editor_response = code_editor(
            st.session_state.resume_content,
            lang="markdown",
            theme="github",
            height=500,
            key=editor_key,
            shortcuts="vscode",
            focus=True,
            buttons=[{
                "name": "update",
                "feather": "Save",
                "primary": True,
                "hasText": True,
                "showWithIcon": True,
                "commands": ["submit"],
                "style": {"bottom": "0rem", "right": "0.4rem"}
            }]
        )
        
        # Process editor response properly
        if editor_response and editor_response['type'] == "submit" and len(editor_response['text']) > 0:
            st.session_state.resume_content = editor_response['text']
            st.success("Content updated!")
            
        col1a, col1b = st.columns([1, 1])
        with col1a:
            uploaded_file = st.file_uploader("Load Markdown File", type=["md"], key="md_uploader")
            if uploaded_file is not None:
                # Update content and force refresh
                st.session_state.resume_content = uploaded_file.getvalue().decode("utf-8")
                log_message(f"Loaded markdown file: {uploaded_file.name}")
                st.experimental_rerun()  # Use experimental_rerun instead of rerun
        
        with col1b:
            if st.button("Generate PDF", key="gen_pdf_btn"):
                if st.session_state.resume_content:
                    with st.spinner("Generating PDF..."):
                        pdf_path = generate_pdf_from_markdown(
                            st.session_state.resume_content, 
                            st.session_state.temp_dir
                        )
                        if pdf_path:
                            st.session_state.pdf_path = pdf_path
                            log_message("PDF generated successfully")
                        else:
                            st.error("Failed to generate PDF")
                else:
                    st.warning("Please enter resume content first")
    
    with tab2:
        if st.session_state.pdf_path and os.path.exists(st.session_state.pdf_path):
            with open(st.session_state.pdf_path, "rb") as f:
                pdf_bytes = f.read()
            st.download_button(
                label="Download PDF",
                data=pdf_bytes,
                file_name="resume.pdf",
                mime="application/pdf"
            )
            # Display PDF using HTML iframe
            base64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
            pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="100%" height="600" type="application/pdf"></iframe>'
            st.markdown(pdf_display, unsafe_allow_html=True)
        else:
            st.info("No PDF generated yet. Create your resume and click 'Generate PDF'.")

# Right column - Job description and optimization
with col2:
    st.header("Job Description")
    
    # URL input
    col2a, col2b = st.columns([3, 1])
    with col2a:
        job_url = st.text_input("Job Posting URL")
    with col2b:
        if st.button("Fetch") and job_url:
            with st.spinner("Fetching job description..."):
                success, content = fetch_job_description_from_url(job_url)
                if success:
                    st.session_state.job_desc = content
                    log_message(f"Job description fetched from {job_url}")
                    st.rerun()
                else:
                    st.error(f"Failed to fetch: {content}")
    
    # Job description text area
    job_desc = st.text_area(
        "Job Description", 
        value=st.session_state.job_desc, 
        height=300,
        key="job_desc_editor"
    )
    st.session_state.job_desc = job_desc
    
    # Score display
    st.subheader("ATS Score")
    score_col1, score_col2 = st.columns([1, 3])
    with score_col1:
        st.metric("Current Score", f"{st.session_state.current_score}%")
    with score_col2:
        if st.session_state.score_history and len(st.session_state.score_history) > 1:
            score_df = pd.DataFrame({
                "Attempt": range(len(st.session_state.score_history)),
                "Score": st.session_state.score_history
            })
            st.line_chart(score_df, x="Attempt", y="Score")
    
    # Score and optimize buttons
    score_btn, optimize_btn = st.columns(2)
    
    with score_btn:
        if st.button("Score Resume"):
            if st.session_state.resume_content and st.session_state.job_desc:
                with st.spinner("Analyzing resume..."):
                    # Generate PDF first
                    pdf_path = generate_pdf_from_markdown(
                        st.session_state.resume_content,
                        st.session_state.temp_dir
                    )
                    
                    if pdf_path:
                        st.session_state.pdf_path = pdf_path
                        # Score the resume
                        score_result = score_resume(
                            pdf_path, 
                            st.session_state.resume_content,
                            st.session_state.job_desc
                        )
                        
                        if score_result["success"]:
                            score = score_result["score"]
                            st.session_state.current_score = score
                            
                            # Update score history
                            if not st.session_state.score_history or st.session_state.score_history[-1] != score:
                                st.session_state.score_history.append(score)
                            
                            # Update highest score
                            if score > st.session_state.highest_score:
                                st.session_state.highest_score = score
                                log_message(f"New highest score achieved: {score}%")
                            
                            log_message(f"Resume scored: {score}%")
                            st.success(f"Resume scored: {score}%")
                            st.rerun()
                        else:
                            st.error(f"Scoring failed: {score_result['message']}")
                    else:
                        st.error("Failed to generate PDF for scoring")
            else:
                st.warning("Please provide both resume content and job description")
    
    with optimize_btn:
        if st.button("Auto-Optimize Resume"):
            st.warning("Auto-optimization will be implemented in a future update")
            log_message("Auto-optimization requested (not yet implemented)")

# Display log at the bottom
st.header("Log")
log_container = st.container()
with log_container:
    for msg in st.session_state.log_messages:
        st.text(msg)