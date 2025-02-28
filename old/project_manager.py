import os
import json
import time
import shutil

def get_project_list():
    """Get a list of available projects"""
    if not os.path.exists("projects"):
        os.makedirs("projects", exist_ok=True)
        return []
    
    return [d for d in os.listdir("projects") 
            if os.path.isdir(os.path.join("projects", d))]

def save_project(company_name, project_data):
    """
    Save a project to disk.
    
    Args:
        company_name: Name of the company/project
        project_data: Dictionary containing project data
        
    Returns:
        Tuple of (success, message)
    """
    try:
        # Create projects directory if it doesn't exist
        os.makedirs("projects", exist_ok=True)
        
        # Create company-specific directory (replace spaces with underscores)
        safe_company_name = company_name.replace(" ", "_").replace("/", "_").replace("\\", "_")
        project_dir = os.path.join("projects", safe_company_name)
        
        # Create project directory
        os.makedirs(project_dir, exist_ok=True)
        
        # Save resume markdown
        with open(os.path.join(project_dir, "resume.md"), "w") as f:
            f.write(project_data.get("resume", ""))
        
        # Save job description
        with open(os.path.join(project_dir, "job_description.md"), "w") as f:
            f.write(project_data.get("job_desc", ""))
        
        # Save score history
        with open(os.path.join(project_dir, "score_history.json"), "w") as f:
            json.dump({
                "current_score": project_data.get("current_score", 0),
                "highest_score": project_data.get("highest_score", 0),
                "score_chain": project_data.get("score_history", [0])
            }, f)
        
        # Save project metadata
        project_meta = {
            "company_name": company_name,
            "date_created": time.strftime("%Y-%m-%d %H:%M:%S"),
            "date_modified": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        with open(os.path.join(project_dir, "project_meta.json"), "w") as f:
            json.dump(project_meta, f)
        
        return True, f"Project '{company_name}' saved successfully"
    
    except Exception as e:
        return False, f"Error saving project: {e}"

def load_project(project_name):
    """
    Load a project from disk.
    
    Args:
        project_name: Name of the project to load
        
    Returns:
        Tuple of (success, message, data)
    """
    try:
        project_dir = os.path.join("projects", project_name)
        
        if not os.path.exists(project_dir):
            return False, f"Project '{project_name}' not found", {}
        
        data = {}
        
        # Load resume
        resume_path = os.path.join(project_dir, "resume.md")
        if os.path.exists(resume_path):
            with open(resume_path, "r") as f:
                data["resume"] = f.read()
        
        # Load job description
        job_desc_path = os.path.join(project_dir, "job_description.md")
        if os.path.exists(job_desc_path):
            with open(job_desc_path, "r") as f:
                data["job_desc"] = f.read()
        
        # Load score history
        score_path = os.path.join(project_dir, "score_history.json")
        if os.path.exists(score_path):
            with open(score_path, "r") as f:
                scores = json.load(f)
                data["current_score"] = scores.get("current_score", 0)
                data["highest_score"] = scores.get("highest_score", 0)
                data["score_history"] = scores.get("score_chain", [0])
        
        return True, "Project loaded successfully", data
    
    except Exception as e:
        return False, f"Error loading project: {e}", {}