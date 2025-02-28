import os
import tempfile
import requests
from bs4 import BeautifulSoup

def setup_temp_dir():
    """Create and set up a temporary directory structure"""
    temp_dir = tempfile.mkdtemp()
    os.makedirs(os.path.join(temp_dir, "temp"), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, "temp/max"), exist_ok=True)
    return temp_dir

def fetch_job_description_from_url(url):
    """
    Fetch job description from a URL.
    
    Args:
        url: The URL to fetch from
        
    Returns:
        Tuple of (success, content/error_message)
    """
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
            
            return True, text
        else:
            return False, f"Failed to fetch job description. Status code: {response.status_code}"
    except Exception as e:
        return False, f"Error fetching job description: {e}"