from dataclasses import dataclass
from typing import List, Optional
from datetime import date

@dataclass
class Education:
    institution: str
    location: str
    degree: str
    gpa: Optional[float]
    graduation_date: date
    relevant_coursework: Optional[List[str]] = None
    additional_info: Optional[List[str]] = None

@dataclass
class Experience:
    company: str
    location: str
    title: str
    start_date: date
    end_date: date
    description: List[str]

@dataclass
class Leadership:
    organization: str
    location: str
    title: str
    start_date: date
    end_date: date
    description: List[str]

@dataclass
class Skills:
    technical: List[str]
    language: List[str]
    interests: List[str]

@dataclass
class PersonalInfo:
    name: str
    street_address: str
    city: str
    state: str
    zip_code: str
    email: str
    phone: str

class HarvardResumeFormatter:
    def __init__(self, personal_info: PersonalInfo):
        self.personal_info = personal_info
        self.education: List[Education] = []
        self.experience: List[Experience] = []
        self.leadership: List[Leadership] = []
        self.skills: Optional[Skills] = None

    def add_education(self, education: Education):
        self.education.append(education)

    def add_experience(self, experience: Experience):
        self.experience.append(experience)

    def add_leadership(self, leadership: Leadership):
        self.leadership.append(leadership)

    def set_skills(self, skills: Skills):
        self.skills = skills

    def format_date(self, d: date) -> str:
        return d.strftime("%B %Y")

    def generate_header(self) -> str:
        return f"""{self.personal_info.name}
{self.personal_info.street_address} • {self.personal_info.city}, {self.personal_info.state} {self.personal_info.zip_code} • {self.personal_info.email} • {self.personal_info.phone}
"""

    def format_education(self) -> str:
        education_section = ["Education"]
        for edu in self.education:
            location_line = f"{edu.institution}{' ' * (75 - len(edu.institution))}{edu.location}"
            education_section.append(location_line)
            
            if edu.gpa:
                education_section.append(f"{edu.degree}. GPA {edu.gpa:.2f}. {self.format_date(edu.graduation_date)}")
            else:
                education_section.append(f"{edu.degree}. {self.format_date(edu.graduation_date)}")
            
            if edu.relevant_coursework:
                education_section.append(f"Relevant Coursework: {', '.join(edu.relevant_coursework)}.")
            
            if edu.additional_info:
                for info in edu.additional_info:
                    education_section.append(info)
            
            education_section.append("")
        
        return "\n".join(education_section)

    def format_experience(self) -> str:
        experience_section = ["Experience"]
        for exp in self.experience:
            location_line = f"{exp.company}{' ' * (75 - len(exp.company))}{exp.location}"
            date_range = f"{self.format_date(exp.start_date)} - {self.format_date(exp.end_date)}"
            experience_section.extend([
                location_line,
                f"{exp.title}{' ' * (75 - len(exp.title))}{date_range}"
            ])
            
            for bullet in exp.description:
                experience_section.append(f"• {bullet}")
            
            experience_section.append("")
        
        return "\n".join(experience_section)

    def format_leadership(self) -> str:
        leadership_section = ["Leadership"]
        for lead in self.leadership:
            location_line = f"{lead.organization}{' ' * (75 - len(lead.organization))}{lead.location}"
            date_range = f"{self.format_date(lead.start_date)} - {self.format_date(lead.end_date)}"
            leadership_section.extend([
                location_line,
                f"{lead.title}{' ' * (75 - len(lead.title))}{date_range}"
            ])
            
            for bullet in lead.description:
                leadership_section.append(f"• {bullet}")
            
            leadership_section.append("")
        
        return "\n".join(leadership_section)

    def format_skills(self) -> str:
        if not self.skills:
            return ""
        
        skills_section = ["Skills & Interests"]
        if self.skills.technical:
            skills_section.append(f"Technical: {', '.join(self.skills.technical)}.")
        if self.skills.language:
            skills_section.append(f"Language: {', '.join(self.skills.language)}.")
        if self.skills.interests:
            skills_section.append(f"Interests: {', '.join(self.skills.interests)}.")
        
        return "\n".join(skills_section)

    def generate_resume(self) -> str:
        sections = [
            self.generate_header(),
            self.format_education(),
            self.format_experience(),
            self.format_leadership(),
            self.format_skills()
        ]
        return "\n\n".join(sections)
