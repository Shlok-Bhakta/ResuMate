import os
import subprocess
# from simple_ats import ATS

def score_resume(pdf_path, resume_markdown, job_desc):
    """
    Score a resume against a job description using ATS.
    
    Args:
        pdf_path: Path to the generated PDF
        resume_markdown: The markdown content of the resume
        job_desc: The job description text
        
    Returns:
        Dict with success status, score and message
    """
    try:
        # Extract text from PDF
        txt_path = pdf_path.replace('.pdf', '.txt')
        subprocess.call(["pdftotext", pdf_path, txt_path])
        
        # Read text content
        with open(txt_path, "r") as f:
            resume_content = f.read()
            
        # Score with ATS
        # ats = ATS()
        # ats.load_resume(resume_content)
        # ats.load_job_description(job_desc)
        # ats.clean_jd()
        
        # experience = ats.extract_experience()
        # ats.clean_experience(experience)
        
        # skills = " ".join(ats.extract_skills())
        # ats.clean_skills(skills)
        
        # similarity_score = ats.calculate_detailed_score()
        # score = round(similarity_score["overall_score"] * 100, 2)
        
        score = 10
        similarity_score = 20
        
        return {
            "success": True,
            "score": score,
            "details": similarity_score
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }