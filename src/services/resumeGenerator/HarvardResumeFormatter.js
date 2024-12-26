// src/services/resumeGenerator/HarvardResumeFormatter.js
export class HarvardResumeFormatter {
    constructor(personalInfo) {
      this.personalInfo = personalInfo;
      this.education = [];
      this.experience = [];
      this.leadership = [];
      this.skills = null;
    }
  
    addEducation(education) {
      this.education.push(education);
    }
  
    addExperience(experience) {
      this.experience.push(experience);
    }
  
    addLeadership(leadership) {
      this.leadership.push(leadership);
    }
  
    setSkills(skills) {
      this.skills = skills;
    }
  
    formatDate(date) {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  
    generateHeader() {
      return `${this.personalInfo.name}
  ${this.personalInfo.street_address} • ${this.personalInfo.city}, ${this.personalInfo.state} ${this.personalInfo.zip_code} • ${this.personalInfo.email} • ${this.personalInfo.phone}`;
    }
  
    formatEducation() {
      const sections = ['Education'];
      
      this.education.forEach(edu => {
        const locationLine = `${edu.institution}${' '.repeat(75 - edu.institution.length)}${edu.location}`;
        sections.push(locationLine);
        
        if (edu.gpa) {
          sections.push(`${edu.degree}. GPA ${edu.gpa.toFixed(2)}. ${this.formatDate(edu.graduation_date)}`);
        } else {
          sections.push(`${edu.degree}. ${this.formatDate(edu.graduation_date)}`);
        }
        
        if (edu.relevant_coursework?.length) {
          sections.push(`Relevant Coursework: ${edu.relevant_coursework.join(', ')}.`);
        }
        
        if (edu.additional_info?.length) {
          edu.additional_info.forEach(info => sections.push(info));
        }
        
        sections.push('');
      });
      
      return sections.join('\n');
    }
  
    formatExperience() {
      const sections = ['Experience'];
      
      this.experience.forEach(exp => {
        const locationLine = `${exp.company}${' '.repeat(75 - exp.company.length)}${exp.location}`;
        const dateRange = `${this.formatDate(exp.start_date)} - ${this.formatDate(exp.end_date)}`;
        sections.push(locationLine);
        sections.push(`${exp.title}${' '.repeat(75 - exp.title.length)}${dateRange}`);
        
        exp.description.forEach(bullet => {
          sections.push(`• ${bullet}`);
        });
        
        sections.push('');
      });
      
      return sections.join('\n');
    }
  
    formatLeadership() {
      const sections = ['Leadership'];
      
      this.leadership.forEach(lead => {
        const locationLine = `${lead.organization}${' '.repeat(75 - lead.organization.length)}${lead.location}`;
        const dateRange = `${this.formatDate(lead.start_date)} - ${this.formatDate(lead.end_date)}`;
        sections.push(locationLine);
        sections.push(`${lead.title}${' '.repeat(75 - lead.title.length)}${dateRange}`);
        
        lead.description.forEach(bullet => {
          sections.push(`• ${bullet}`);
        });
        
        sections.push('');
      });
      
      return sections.join('\n');
    }
  
    formatSkills() {
      if (!this.skills) return '';
      
      const sections = ['Skills & Interests'];
      
      if (this.skills.technical?.length) {
        sections.push(`Technical: ${this.skills.technical.join(', ')}.`);
      }
      if (this.skills.language?.length) {
        sections.push(`Language: ${this.skills.language.join(', ')}.`);
      }
      if (this.skills.interests?.length) {
        sections.push(`Interests: ${this.skills.interests.join(', ')}.`);
      }
      
      return sections.join('\n');
    }
  
    generateResume() {
      const sections = [
        this.generateHeader(),
        this.formatEducation(),
        this.formatExperience(),
        this.formatLeadership(),
        this.formatSkills()
      ];
      
      return sections.join('\n\n');
    }
  }