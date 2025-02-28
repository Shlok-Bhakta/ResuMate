import nltk
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ATS:
    def __init__(self):
        self.resume_content = ""
        self.job_description = ""
        self.vectorizer = TfidfVectorizer(stop_words='english')
        
    def load_resume(self, content):
        self.resume_content = content
        
    def load_job_description(self, content):
        self.job_description = content
        
    def clean_jd(self):
        # Simple cleaning
        self.job_description = self.job_description.lower()
        
    def extract_experience(self):
        # Simple extraction
        return self.resume_content
        
    def clean_experience(self, experience):
        # Simple cleaning
        pass
        
    def extract_skills(self):
        # Simple skill extraction
        words = nltk.word_tokenize(self.resume_content)
        return words
        
    def clean_skills(self, skills):
        # Simple cleaning
        pass
        
    def compute_similarity(self):
        # Calculate cosine similarity between resume and job description
        documents = [self.resume_content, self.job_description]
        try:
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            return similarity[0][0]
        except:
            return np.array([0.0])
    
    def identify_sections(self):
        """Identify common sections in job descriptions"""
        sections = {}
        
        # Common section headers in job descriptions
        section_headers = [
            "description", "about the role", "about the job", "overview",
            "responsibilities", "duties", "what you'll do", "key responsibilities",
            "requirements", "qualifications", "skills", "what you need", "required skills",
            "experience", "education", "benefits", "perks", "what we offer"
        ]
        
        lines = self.job_description.split('\n')
        current_section = "general"
        sections[current_section] = []
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if this line is a section header
            is_header = False
            for header in section_headers:
                if header in line_lower and len(line_lower) < 50:  # Assuming headers are short
                    current_section = header
                    sections[current_section] = []
                    is_header = True
                    break
            
            if not is_header:
                sections[current_section].append(line)
        
        # Combine the lines in each section
        for section in sections:
            sections[section] = '\n'.join(sections[section])
        
        return sections

    def extract_skills_from_text(self, text):
        """Extract technical and soft skills from text using NLP"""
        # Technical skills commonly found in job descriptions
        tech_skills = [
            'python', 'java', 'javascript', 'c++', 'c#', 'sql', 'nosql', 
            'react', 'angular', 'vue', 'node', 'aws', 'azure', 'git',
            'docker', 'kubernetes', 'machine learning', 'ai', 'data science',
            'html', 'css', 'php', 'ruby', 'swift', 'kotlin', 'scala',
            'mongodb', 'mysql', 'postgresql', 'oracle', 'rest', 'api',
            'cloud', 'devops', 'ci/cd', 'agile', 'scrum', 'jira'
        ]
        
        # Soft skills
        soft_skills = [
            'communication', 'teamwork', 'problem solving', 'problem-solving',
            'leadership', 'time management', 'creativity', 'critical thinking',
            'adaptability', 'collaboration', 'analytical', 'detail oriented',
            'multitasking', 'organization', 'interpersonal'
        ]

        # Call an LLM to extract through openrouter

        found_skills = []
        text_lower = text.lower()
        
        # Check for technical skills
        for skill in tech_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        # Check for soft skills
        for skill in soft_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return list(set(found_skills))  # Remove duplicates

    def calculate_detailed_score(self):
        """Calculate a detailed matching score between resume and job description"""
        # Identify sections in the job description
        jd_sections = self.identify_sections()
        
        # Extract skills from requirements section if available, otherwise from whole document
        if 'requirements' in jd_sections:
            jd_skills = self.extract_skills_from_text(jd_sections['requirements'])
        else:
            jd_skills = self.extract_skills_from_text(self.job_description)
        print(f"Skills: {jd_skills}") 
        # Extract skills from resume
        resume_skills = self.extract_skills_from_text(self.resume_content)
        
        # Calculate skill match percentage
        if len(jd_skills) > 0:
            matched_skills = [skill for skill in jd_skills if skill in resume_skills]
            skill_match_percentage = len(matched_skills) / len(jd_skills)
        else:
            matched_skills = []
            skill_match_percentage = 0
        
        # Calculate missing skills
        missing_skills = [skill for skill in jd_skills if skill not in resume_skills]
        
        # Calculate overall document similarity using TF-IDF
        cosine_sim = self.compute_similarity()
        
        # Calculate weighted score - more weight to skill matching than general document similarity
        overall_score = 0.7 * skill_match_percentage + 0.3 * cosine_sim
        
        return {
            'overall_score': float(overall_score),
            'skill_match_score': skill_match_percentage,
            'document_similarity': float(cosine_sim),
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'total_skills_required': len(jd_skills),
            'skills_matched': len(matched_skills)
        }

    def analyze_resume(self):
                """Perform complete analysis of resume against job description"""
                self.clean_jd()
                return self.calculate_detailed_score()