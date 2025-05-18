import os
import sys
from traceback import print_exc
from io import BytesIO

# Add the current directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from openai import OpenAI
from datetime import datetime
from harvard_resume_formatter import (
    HarvardResumeFormatter,
    PersonalInfo,
    Education,
    Experience,
    Leadership,
    Skills,
)

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from Firebase_Setup import db, storage

# ✅ Load the API key first
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

# ✅ Then create the OpenAI client
client = OpenAI(api_key=api_key)

# Create restest directory if it doesn't exist
RESUME_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "restest")
os.makedirs(RESUME_DIR, exist_ok=True)

def upload_pdf_to_firebase(pdf_bytes, user_id, job_id):
    """Upload PDF to Firebase Storage and return the download URL"""
    try:
        # Create a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"resume_{job_id}_{timestamp}.pdf"
        
        # Create the storage path
        storage_path = f"resumes/{user_id}/{filename}"
        
        # Upload the PDF
        blob = storage.bucket().blob(storage_path)
        blob.upload_from_string(pdf_bytes, content_type='application/pdf')
        
        # Get the download URL
        blob.make_public()
        download_url = blob.public_url
        
        # Update the job document with the resume URL
        job_ref = db.collection("Jobs").document(job_id)
        job_ref.update({
            "resume_url": download_url
        })
        
        return download_url
        
    except Exception as e:
        print(f"Error uploading PDF to Firebase: {str(e)}")
        raise

def create_pdf_resume(resume_data):
    """Create a polished Harvard-style PDF resume and return the PDF bytes"""
    # Create a BytesIO object to store the PDF
    pdf_buffer = BytesIO()
    
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                           rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    # Custom styles
    name_style = ParagraphStyle(
        'Name',
        parent=styles['Heading1'],
        fontSize=16,
        leading=22,
        spaceAfter=6,
        textColor=colors.black,
        alignment=1,  # Center
        fontName='Helvetica-Bold'
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        fontSize=8,
        leading=12,
        spaceAfter=12,
        textColor=colors.black,
        alignment=1,  # Center
        fontName='Helvetica'
    )
    
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontSize=10,
        leading=14,
        spaceBefore=6,
        spaceAfter=2,
        textColor=colors.black,
        fontName='Helvetica-Bold',
        textTransform='uppercase'
    )
    
    company_style = ParagraphStyle(
        'Company',
        parent=styles['Normal'],
        fontSize=8,
        leading=12,
        spaceAfter=2,
        textColor=colors.black,
        fontName='Helvetica-Bold'
    )
    
    role_style = ParagraphStyle(
        'Role',
        parent=styles['Normal'],
        fontSize=8,
        leading=12,
        spaceAfter=4,
        textColor=colors.black,
        fontName='Helvetica-Oblique'
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontSize=8,
        leading=12,
        leftIndent=12,
        bulletIndent=0,
        spaceAfter=2,
        textColor=colors.black,
        fontName='Helvetica'
    )
    
    story = []
    
    # === HEADER SECTION ===
    personal = resume_data['personal_info']
    story.append(Paragraph(personal['name'], name_style))
    contact_info = f"{personal['address']} • {personal['email']} • {personal['phone']}"
    story.append(Paragraph(contact_info, contact_style))
    story.append(Spacer(1, 6))
    
    # Add separator line after header
    separator = Table([['']], colWidths=[doc.width - 0.5*inch], rowHeights=[0.5])  # Increased width
    separator.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),  # Reduced padding
    ]))
    story.append(separator)
    story.append(Spacer(1, 6))
    
    # === EXPERIENCE SECTION ===
    story.append(Paragraph("EXPERIENCE", section_style))
    story.append(Spacer(1, 6))
    
    for exp in resume_data['experience']:
        # Create table for experience entry with company and position on same line
        data = [
            [Paragraph(f"<b>{exp['company']} | {exp['position']}</b>", company_style),
             Paragraph(f"{exp['start_date']} to {exp['end_date']}", company_style)]
        ]
        
        t = Table(data, colWidths=[doc.width*0.7, doc.width*0.3])
        t.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t)
        
        # Add bullet points
        for bullet in exp['description']:
            story.append(Paragraph(f"• {bullet}", bullet_style))
            
        story.append(Spacer(1, 8))
    
    # Add separator line after experience
    story.append(separator)
    story.append(Spacer(1, 6))
    
    # === EDUCATION SECTION ===
    story.append(Paragraph("EDUCATION", section_style))
    story.append(Spacer(1, 6))
    
    for edu in resume_data['education']:
        # Create table for education entry
        data = [
            [Paragraph(f"<b>{edu['institution']}</b>", company_style),
             Paragraph(edu['graduation_date'], company_style)],
            [Paragraph(f"<i>{edu['degree']}</i>", role_style), ""]
        ]
        
        t = Table(data, colWidths=[doc.width*0.7, doc.width*0.3])
        t.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t)
        
        # Add location
        story.append(Paragraph(edu['location'], bullet_style))
        
        # Add relevant coursework if available
        if edu.get('relevant_coursework'):
            coursework = f"Relevant Coursework: {', '.join(edu['relevant_coursework'])}."
            story.append(Paragraph(coursework, bullet_style))
            
        story.append(Spacer(1, 8))
    
    # Add separator line after education
    story.append(separator)
    story.append(Spacer(1, 6))
    
    # === SKILLS SECTION ===
    story.append(Paragraph("SKILLS & INTERESTS", section_style))
    story.append(Spacer(1, 6))
    
    skills = resume_data['skills']
    if skills['technical']:
        story.append(Paragraph(f"Technical: {', '.join(skills['technical'])}.", bullet_style))
    if skills['language']:
        story.append(Paragraph(f"Language: {', '.join(skills['language'])}.", bullet_style))
    if skills['interests']:
        story.append(Paragraph(f"Interests: {', '.join(skills['interests'])}.", bullet_style))
    
    print("Building PDF document...")
    doc.build(story)
    print("PDF document built successfully")
    
    # Get the PDF bytes
    pdf_bytes = pdf_buffer.getvalue()
    pdf_buffer.close()
    
    return pdf_bytes

def fetch_user_data(user_id, job_id):
    """Fetch user data and job details from Firebase"""
    try:
        print(f"Attempting to fetch data for user ID: {user_id}")
        
        # Get user document
        user_ref = db.collection('Users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            print(f"User document not found in 'Users' collection")
            # Try lowercase collection name as fallback
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            if not user_doc.exists:
                raise Exception(f"User {user_id} not found in either 'Users' or 'users' collection")
            
        user_data = user_doc.to_dict()
        print(f"Found user data: {user_data}")
        
        # Get job from global jobs collection
        job = get_job_by_id(job_id)
        if job.get("user_id") != user_id:
            raise Exception(f"Job {job_id} does not belong to user {user_id}")
            
        return user_data, [job]
        
    except Exception as e:
        print(f"Error fetching user data: {str(e)}")
        raise

def get_job_by_id(job_id):
    """Fetch a specific job from the global jobs collection"""
    job_ref = db.collection("Jobs").document(job_id)
    doc = job_ref.get()
    if not doc.exists:
        raise Exception(f"Job {job_id} not found")
    
    job_data = doc.to_dict()
    job_data['id'] = doc.id  # Add the ID manually
    return job_data


def tailor_experience_with_gpt(user_experience, job_description):
    """Use GPT to tailor experience to job description"""
    try:
        prompt = f"""
        You are tasked with assisting the user to rewrite resume bullet points for various job listings. Your mission is to ensure these bullets match the job descriptions provided by each user, you must create good descriptions that will help the user get the job.
        while keeping the content professional and ATS-friendly.
        Focus on:

                Aligning each bullet point with the keywords and requirements in the job description
                Highlighting quantifiable achievements, tools, and relevant experiences
                Making phrasing impactful, concise, and tailored to the role
                For each user:

        💼 Job Description:
        {job_description}

        ---

        📄 Original Experience:
        {user_experience}

        ---

        ✍️ Rewrite exactly three bullet points for this experience to maximize alignment with the job, keeping them professional and ATS-friendly. 
        Only output the three revised bullet points, separated by line breaks. 
        Prioritize numbers, quantitative results, and keywords an ATS system would look for in that role.
        IMPORTANT RULES:
        1. Output exactly three bullet points, no more, no less
        2. Never use any type of dash (m dash, n dash, or hyphen) to separate words
        3. Only use commas, periods, and bullet points as punctuation
        4. DO NOT include bullet point characters (•) at the start of each point
        5. Do not include any other text or formatting
        """

        response = client.chat.completions.create(model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a professional resume writer."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500)

        raw_response = response.choices[0].message.content.strip()
        
        # Clean up any bullet points that GPT might have included anyway
        cleaned_bullets = []
        for line in raw_response.split('\n'):
            # Remove bullet points and any leading whitespace
            cleaned_line = line.strip()
            if cleaned_line.startswith('•'):
                cleaned_line = cleaned_line[1:].strip()
            cleaned_bullets.append(cleaned_line)
            
        return '\n'.join(cleaned_bullets)
        
    except Exception as e:
        print(f"Error with GPT: {str(e)}")
        return user_experience

def format_date(date_obj=None, date_str=None):
    """Helper function to format dates consistently with 3-letter month"""
    if date_obj:
        return date_obj.strftime('%b %Y')  # Changed to 3-letter month
    elif date_str:
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').strftime('%b %Y')  # Changed to 3-letter month
        except:
            pass
    return 'Present'

def generate_resume(user_id, job_id):
    """Generate a tailored resume for a specific job and store it in Firebase"""
    try:
        # Fetch user data and job details
        user_data, jobs = fetch_user_data(user_id, job_id)
        job = next((j for j in jobs if j.get('id') == job_id), None)
        
        if not job:
            raise Exception(f"Job {job_id} not found for user {user_id}")
        
        print(f"Found job data: {job}")  # Debug print
        
        # Get user location (fallback to a default if not found)
        user_location = user_data.get('jobSearchPreferences', {}).get('jobPreferences', {}).get('location', 'Unknown')
        
        # Create PersonalInfo
        personal_info = PersonalInfo(
            name=user_data.get('fullName', ''),
            email=user_data.get('email', ''),
            phone=user_data.get('phone', ''),
            street_address='',
            city=user_location.split(',')[0].strip() if user_location else 'Unknown',
            state=user_location.split(',')[1].strip() if ',' in user_location else 'Unknown',
            zip_code=''
        )
        
        # Initialize resume formatter
        resume = HarvardResumeFormatter(personal_info)
        
        # Add Education
        education_section = []
        for edu in user_data.get('education', []):
            # Handle dates safely
            start_date_str = edu.get('startDate', '')
            end_date_str = edu.get('endDate', '')
            
            # Get school location, using new field with fallback
            school_location = edu.get('schoolCityState', user_location)
            
            education = Education(
                institution=edu.get('school', ''),
                location=school_location,
                degree=edu.get('degree', ''),
                graduation_date=datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else None,
                gpa=None,
                relevant_coursework=[]
            )
            
            try:
                resume.add_education(education)
            except Exception as e:
                print(f"Error adding education: {str(e)}")
                print_exc()
            
            education_section.append({
                'institution': education.institution,
                'location': education.location,
                'degree': education.degree,
                'graduation_date': format_date(date_obj=education.graduation_date),
                'gpa': education.gpa,
                'relevant_coursework': education.relevant_coursework or []
            })
        
        # Add Experience (tailored with GPT)
        experience_section = []
        for exp in user_data.get('workExperience', []):
            # Tailor experience with GPT
            original_description = exp.get('description', '')
            job_description = job.get('Description', '')
            print(f"Job description: {job_description}")  # Debug print
            tailored = tailor_experience_with_gpt(original_description, job_description)
            
            # Handle dates safely
            start_date_str = exp.get('startDate', '')
            end_date_str = exp.get('endDate', '')
            
            # Process bullet points
            bullets = [b.strip() for b in tailored.split('\n') if b.strip()] 
            if not bullets:
                bullets = ["No description provided"]
            
            try:
                experience = Experience(
                    company=exp.get('company', ''),
                    title=exp.get('title', ''),
                    position=exp.get('position', ''),
                    location=user_location,
                    start_date=datetime.strptime(start_date_str, '%Y-%m-%d') if start_date_str else None,
                    end_date=datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else None,
                    description=bullets
                )
                resume.add_experience(experience)
            except Exception as e:
                print(f"Error adding experience: {str(e)}")
                print_exc()
            
            experience_section.append({
                'company': exp.get('company', ''),
                'title': exp.get('title', ''),
                'position': exp.get('position', ''),
                'location': user_location,
                'start_date': format_date(date_str=start_date_str),
                'end_date': format_date(date_str=end_date_str),
                'description': bullets
            })
        
        # Add Skills
        skills = Skills(
            technical=user_data.get('skills', []),
            language=["English"],
            interests=["Leadership", "Communication", "Problem Solving"]
        )
        resume.set_skills(skills)
        skills_section = {
            'technical': skills.technical,
            'language': skills.language,
            'interests': skills.interests
        }
        
        # Create structured resume data
        resume_data = {
            'personal_info': {
                'name': personal_info.name,
                'email': personal_info.email,
                'phone': personal_info.phone,
                'address': user_location
            },
            'education': education_section,
            'experience': experience_section,
            'skills': skills_section,
            'job_target': {
                'title': job.get('title', ''),
                'company': job.get('company', ''),
                'description': job.get('Description', '')
            }
        }
        
        # Generate PDF bytes
        pdf_bytes = create_pdf_resume(resume_data)
        
        # Upload to Firebase Storage and get the URL
        resume_url = upload_pdf_to_firebase(pdf_bytes, user_id, job_id)
        
        print(f"Resume uploaded to Firebase: {resume_url}")
        
        return resume_data
        
    except Exception as e:
        print(f"Error generating resume: {str(e)}")
        print_exc()
        raise

if __name__ == "__main__":
    # Example usage with specific user and job IDs
    try:
        user_id = "wEApZK7Q96ey5fXYHMZ9kZxGrSX2"
        job_id = "09iL4v4JUj3ONYPbcsfv"
        print(f"Generating resume for user {user_id} and job {job_id}")
        resume = generate_resume(user_id, job_id)
        if resume:
            print("Resume generated and uploaded successfully!")
        else:
            print("Resume was not generated")
    except Exception as e:
        print(f"Error: {str(e)}")
        print_exc()