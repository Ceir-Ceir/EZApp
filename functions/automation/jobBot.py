import os
import asyncio
import logging
import time
import json
import re
from datetime import datetime
from io import BytesIO
from Firebase_Setup import bucket, db

# Setup logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("application_bot.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Then try importing DrissionPage
try:
    from DrissionPage import ChromiumPage
    DRISSION_AVAILABLE = True
    logger.info("DrissionPage is available and imported successfully")
except ImportError:
    DRISSION_AVAILABLE = False
    logger.warning("DrissionPage not available. Install with: pip install DrissionPage")

# New imports for DrissionPage
import sys
try:
    from DrissionPage import ChromiumPage
    DRISSION_AVAILABLE = True
except ImportError:
    DRISSION_AVAILABLE = False
    logger.warning("DrissionPage not available. Install with: pip install DrissionPage")

# Fix for the OpenAI import
from openai import OpenAI  # Direct import of the OpenAI class

from Firebase_Setup import db, storage
from playwright.async_api import async_playwright, Page, ElementHandle, TimeoutError

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("application_bot.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load API key
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

# Create OpenAI client
client = OpenAI(api_key=api_key)

# Constants
MAX_RETRIES = 3
WAIT_TIME = 2  # seconds
SCREENSHOT_DIR = "application_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# Common field patterns for detection

FIELD_PATTERNS = {
    "name": ["name", "full name", "first name", "last name"],
    "email": ["email", "e-mail", "e mail"],
    "phone": ["phone", "telephone", "mobile", "cell"],
    "resume": ["resume", "cv", "curriculum vitae", "upload", "attach"],
    "cover_letter": ["cover letter", "cover", "letter", "why"],
    "linkedin": ["linkedin", "social media", "profile url", "linkedin url", "linkedin profile"],
    "website": ["website", "portfolio", "personal site"],
    "address": ["address", "street", "city", "state", "zip", "postal", "location", "current city", "residence"],
    "education": ["education", "degree", "university", "college", "school", "field of study"],
    "experience": ["experience", "work history", "employment", "job title", "past employer"],
    "skills": ["skills", "abilities", "competencies", "expertise", "proficiencies"],
    "references": ["references", "referees"],
    "gender": ["gender", "sex", "gender identity"],
    "race": ["race", "ethnicity", "racial background", "ethnic origin"],
    "veteran": ["veteran", "military", "armed forces"],
    "sponsorship": ["sponsorship", "visa", "work authorization"],
    "over_18": ["18 years", "over 18", "legal age", "adult"],
    "pronouns": ["pronouns", "preferred pronouns", "gender pronouns"]
}

# Application status tracking
class ApplicationStatus:
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CAPTCHA_DETECTED = "captcha_detected"

def get_job_by_id(job_id):
    """Fetch a specific job from Firebase"""
    try:
        job_ref = db.collection("Jobs").document(job_id)
        doc = job_ref.get()
        if not doc.exists:
            raise ValueError(f"Job {job_id} not found")
        
        job_data = doc.to_dict()
        job_data['id'] = doc.id
        return job_data
    except Exception as e:
        logger.error(f"Error fetching job {job_id}: {str(e)}")
        raise

def fetch_user_data(user_id):
    """Fetch user data from Firebase"""
    try:
        user_ref = db.collection('Users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            # Try lowercase collection name as fallback
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            if not user_doc.exists:
                raise ValueError(f"User {user_id} not found")
        
        return user_doc.to_dict()
    except Exception as e:
        logger.error(f"Error fetching user data for {user_id}: {str(e)}")
        raise

def fetch_jobs_for_user(user_id):
    """Fetch all jobs for a user from Firebase"""
    try:
        jobs_ref = db.collection("Jobs").where("user_id", "==", user_id)
        docs = jobs_ref.stream()
        jobs = []
        
        for doc in docs:
            job_data = doc.to_dict()
            job_data['id'] = doc.id
            jobs.append(job_data)
        
        return jobs
    except Exception as e:
        logger.error(f"Error fetching jobs for user {user_id}: {str(e)}")
        raise

def update_job_status(job_id, status, notes=None):
    """Update job application status in Firebase"""
    try:
        job_ref = db.collection("Jobs").document(job_id)
        update_data = {
            "application_status": status,
            "last_application_attempt": datetime.now().isoformat(),
        }
        
        if notes:
            update_data["application_notes"] = notes
        
        job_ref.update(update_data)
        logger.info(f"Updated job {job_id} status to {status}")
    except Exception as e:
        logger.error(f"Error updating job status for {job_id}: {str(e)}")

def save_job_analysis_to_firebase(job_id, analysis, cover_letter):
    """Save job analysis and cover letter to Firebase"""
    try:
        job_ref = db.collection("Jobs").document(job_id)
        job_ref.update({
            "job_analysis": analysis,
            "cover_letter": cover_letter,
            "gpt_cached": True,
            "last_analysis_update": datetime.now().isoformat()
        })
        logger.info(f"Saved job analysis and cover letter for job {job_id}")
    except Exception as e:
        logger.error(f"Error saving job analysis to Firebase: {str(e)}")

def analyze_job_description(description, user_data):
    """Use GPT to analyze job description and prepare application responses"""
    try:
        # Check if we already have cached analysis
        job_id = user_data.get('current_job_id')
        if job_id:
            job_ref = db.collection("Jobs").document(job_id)
            job_doc = job_ref.get()
            if job_doc.exists:
                job_data = job_doc.to_dict()
                if job_data.get('gpt_cached', False) and job_data.get('job_analysis'):
                    logger.info(f"Using cached job analysis for job {job_id}")
                    return job_data['job_analysis']

        prompt = f"""
        You're an expert at filling out job applications. Given the job description and user profile below,
        extract key information and prepare responses for common application questions.
        
        JOB DESCRIPTION:
        {description}
        
        USER PROFILE:
        Name: {user_data.get('fullName', '')}
        Email: {user_data.get('email', '')}
        Phone: {user_data.get('phone', '')}
        Location: {user_data.get('location', '')}
        Skills: {', '.join(user_data.get('skills', []))}
        Education: {json.dumps(user_data.get('education', []))}
        Work Experience: {json.dumps(user_data.get('workExperience', []))}
        
        Please provide the following output in JSON format:
        1. Summary of key job requirements
        2. 2-3 sentence personalized cover letter introduction
        3. Brief answers to common questions like:
           - Why are you interested in this position?
           - What makes you a good fit?
           - Why do you want to work for this company?
           - Describe your relevant experience
        4. Keywords from the job description that match the user's profile
        5. A list of relevant skills from the user profile to highlight
        
        FORMAT RESPONSE AS JSON with these keys: summary, cover_letter_intro, common_answers, keywords, skills_to_highlight
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "system", "content": "You are a job application assistant. Output only valid JSON."},
                      {"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=800
        )
        
        content = response.choices[0].message.content.strip()
        
        # Ensure we get valid JSON
        try:
            # Find JSON content - it might be wrapped in ```json ``` or other markdown
            json_pattern = r'```(?:json)?\s*([\s\S]*?)```'
            json_match = re.search(json_pattern, content)
            
            if json_match:
                content = json_match.group(1).strip()
            
            analysis = json.loads(content)
            
            # Save to Firebase if we have a job_id
            if job_id:
                save_job_analysis_to_firebase(job_id, analysis, None)
            
            return analysis
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from GPT response: {content[:100]}...")
            # Fallback structure
            return {
                "summary": "Error parsing job details",
                "cover_letter_intro": "I am writing to express my interest in the position.",
                "common_answers": {
                    "why_interested": "The role aligns with my skills and career goals.",
                    "why_good_fit": "My experience and skills make me a strong candidate.",
                    "why_company": "I admire the company's reputation and values."
                },
                "keywords": [],
                "skills_to_highlight": []
            }
    except Exception as e:
        logger.error(f"Error analyzing job description: {str(e)}")
        return {}

def generate_cover_letter(job_data, user_data, analysis):
    """Generate a full cover letter using GPT"""
    try:
        # Check if we already have a cached cover letter
        job_id = job_data.get('id')
        if job_id:
            job_ref = db.collection("Jobs").document(job_id)
            job_doc = job_ref.get()
            if job_doc.exists:
                job_data = job_doc.to_dict()
                if job_data.get('gpt_cached', False) and job_data.get('cover_letter'):
                    logger.info(f"Using cached cover letter for job {job_id}")
                    return job_data['cover_letter']

        company_name = job_data.get("company", "the company")
        position = job_data.get("title", "the position")
        
        prompt = f"""
        Write a professional cover letter for a job application with the following details:
        
        CANDIDATE INFO:
        Name: {user_data.get('fullName', '')}
        Skills: {', '.join(user_data.get('skills', []))}
        Experience: {json.dumps(user_data.get('workExperience', [])[:2])}
        
        JOB INFO:
        Company: {company_name}
        Position: {position}
        Job Description Summary: {analysis.get('summary', '')}
        Keywords: {', '.join(analysis.get('keywords', []))}
        
        Create a professional, concise cover letter (250-300 words) that:
        1. Starts with a strong introduction expressing interest in the specific position
        2. Highlights 2-3 most relevant skills/experiences that match the job requirements
        3. Explains why the candidate is interested in this specific company
        4. Concludes with confidence and a call to action
        
        Keep the tone professional but personable. Include specific details from the job and candidate's background.
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "system", "content": "You are a professional resume writer."},
                      {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        cover_letter = response.choices[0].message.content.strip()
        
        # Save to Firebase if we have a job_id
        if job_id:
            save_job_analysis_to_firebase(job_id, analysis, cover_letter)
        
        return cover_letter
    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}")
        return "Error generating cover letter."

async def detect_and_handle_captcha(page, job_id):
    """Detect and handle CAPTCHAs with user intervention"""
    # Check for common CAPTCHA indicators
    captcha_indicators = [
        "recaptcha",
        "i'm not a robot",
        "verify you're human",
        "security check"
    ]
    
    # First, check for reCAPTCHA iframes which are the most reliable indicator
    recaptcha_frames = await page.query_selector_all('iframe[src*="recaptcha"]')
    if recaptcha_frames:
        logger.warning("reCAPTCHA iframe detected")
        await handle_captcha(page, job_id)
        return True
    
    # Check URL for challenge indicators - specifically cloudflare
    url_lower = page.url.lower()
    if "challenge" in url_lower and "cloudflare" in url_lower:
        logger.warning("Cloudflare challenge detected in URL")
        await handle_captcha(page, job_id)
        return True
    
    # Check for specific CAPTCHA elements
    captcha_selectors = [
        'div[class*="captcha"]',
        'div[id*="captcha"]',
        'iframe[src*="captcha"]',
        'div.g-recaptcha',
        '#recaptcha'
    ]
    
    for selector in captcha_selectors:
        element = await page.query_selector(selector)
        if element and await element.is_visible():
            logger.warning(f"CAPTCHA element detected: {selector}")
            await handle_captcha(page, job_id)
            return True
    
    # More careful text content check
    content = await page.content()
    content_lower = content.lower()
    
    for indicator in captcha_indicators:
        # Use a more precise pattern that checks for the exact phrase
        pattern = r'\b' + re.escape(indicator) + r'\b'
        if re.search(pattern, content_lower):
            # Additional check - make sure it's not just in a comment or hidden div
            # Try to find it in visible text
            text_nodes = await page.evaluate('''() => {
                const walker = document.createTreeWalker(
                    document.body, 
                    NodeFilter.SHOW_TEXT, 
                    { acceptNode: (node) => {
                        // Check if parent element is visible
                        const style = window.getComputedStyle(node.parentElement);
                        if (style.display === 'none' || style.visibility === 'hidden') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }}
                );
                
                const textNodes = [];
                while (walker.nextNode()) {
                    textNodes.push(walker.currentNode.textContent);
                }
                return textNodes;
            }''')
            
            for text in text_nodes:
                if re.search(pattern, text.lower()):
                    logger.warning(f"CAPTCHA text detected: {indicator}")
                    await handle_captcha(page, job_id)
                    return True
    
    return False

async def handle_captcha(page, job_id):
    """Pause for user to solve CAPTCHA"""
    logger.warning("\n*** CAPTCHA detected! ***")
    logger.info("Please solve the verification in the browser.")
    logger.info("The application will continue automatically after you solve it.")
    
    # Save a screenshot of the CAPTCHA
    await save_screenshot(page, job_id, "captcha_detected")
    
    # Wait for navigation or user input
    try:
        # Option 1: Wait for navigation (after CAPTCHA is solved)
        logger.info("Waiting for CAPTCHA to be solved (2 minute timeout)...")
        await page.wait_for_navigation(timeout=120000)  # 2 minute timeout
        logger.info("CAPTCHA solved, continuing...")
    except Exception as e:
        # Option 2: If no navigation occurs, wait for user confirmation
        logger.warning(f"Navigation timeout: {str(e)}")
        logger.info("Press Enter once you've completed the verification to continue...")
        input()
    
    # Wait a bit longer to make sure page has fully loaded
    await page.wait_for_timeout(3000)

async def save_screenshot(page, job_id, step):
    """Save a screenshot of the current page state"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{job_id}_{step}_{timestamp}.png"
    filepath = os.path.join(SCREENSHOT_DIR, filename)
    
    await page.screenshot(path=filepath)
    logger.info(f"Screenshot saved: {filepath}")
    return filepath

async def identify_form_fields(page):
    """Identify common form fields on the page"""
    fields_found = {}
    
    # Find all input elements that might be form fields
    inputs = await page.query_selector_all('input, textarea, select, [role="textbox"], [role="combobox"], [role="listbox"]')
    
    for input_element in inputs:
        # Skip hidden fields
        is_hidden = await input_element.evaluate('(el) => window.getComputedStyle(el).display === "none" || el.type === "hidden"')
        if is_hidden:
            continue
        
        # Get element attributes and label text
        try:
            element_id = await input_element.get_attribute('id') or ''
            element_name = await input_element.get_attribute('name') or ''
            element_placeholder = await input_element.get_attribute('placeholder') or ''
            element_type = await input_element.get_attribute('type') or ''
            element_aria_label = await input_element.get_attribute('aria-label') or ''
            element_role = await input_element.get_attribute('role') or ''
            
            # Get associated label if it exists
            label_text = ''
            if element_id:
                label = await page.query_selector(f'label[for="{element_id}"]')
                if label:
                    label_text = await label.inner_text()
            
            # Combine all text sources
            all_text = f"{element_id} {element_name} {element_placeholder} {label_text} {element_aria_label}".lower()
            
            # Identify field type based on patterns
            for field_type, patterns in FIELD_PATTERNS.items():
                for pattern in patterns:
                    if pattern in all_text or pattern in element_type:
                        fields_found[field_type] = input_element
                        break
            
            # Check for demographic questions
            if "veteran" in all_text:
                fields_found["veteran_status"] = input_element
            elif "sponsorship" in all_text or "visa" in all_text:
                fields_found["sponsorship"] = input_element
            elif "work authorization" in all_text or "work auth" in all_text:
                fields_found["work_auth"] = input_element
            elif "race" in all_text or "ethnicity" in all_text:
                fields_found["race"] = input_element
            elif "pronouns" in all_text:
                fields_found["pronouns"] = input_element
            elif "18" in all_text or "age" in all_text:
                fields_found["over_18"] = input_element
            
        except Exception as e:
            logger.warning(f"Error analyzing form field: {str(e)}")
    
    return fields_found

async def find_upload_button(page):
    """Find a resume upload button or field"""
    selectors = [
        'input[type="file"]',
        'button:has-text("Upload")',
        'button:has-text("Attach")',
        'button:has-text("Resume")',
        'button:has-text("CV")',
        '[role="button"]:has-text("Upload")',
        '[role="button"]:has-text("Attach")',
        '.upload',
        'label:has-text("Resume")',
        'label:has-text("CV")',
        'div:has-text("Resume")',
        'div:has-text("CV")'
    ]
    
    for selector in selectors:
        try:
            element = await page.query_selector(selector)
            if element:
                # Check if it's visible and clickable
                is_visible = await element.is_visible()
                is_enabled = await element.is_enabled()
                if is_visible and is_enabled:
                    logger.info(f"Found upload element with selector: {selector}")
                    return element
        except:
            continue
    
    return None

async def find_and_handle_terms_checkboxes(page):
    """Find and handle terms and conditions checkboxes"""
    try:
        # Common selectors for terms checkboxes
        terms_selectors = [
            'input[type="checkbox"]',
            '[role="checkbox"]',
            '.terms-checkbox',
            '.agreement-checkbox',
            'input[name*="terms"]',
            'input[name*="agree"]',
            'input[id*="terms"]',
            'input[id*="agree"]'
        ]
        
        for selector in terms_selectors:
            checkboxes = await page.query_selector_all(selector)
            for checkbox in checkboxes:
                # Check if it's visible and not already checked
                is_visible = await checkbox.is_visible()
                is_checked = await checkbox.is_checked()
                
                if is_visible and not is_checked:
                    # Get surrounding text to verify it's a terms checkbox
                    parent_text = await checkbox.evaluate('el => el.parentElement.textContent')
                    if any(term in parent_text.lower() for term in ['terms', 'agree', 'accept', 'consent']):
                        logger.info(f"Found terms checkbox with text: {parent_text}")
                        await checkbox.check()
                        await page.wait_for_timeout(1000)  # Wait for any animations
                        return True
        
        return False
    except Exception as e:
        logger.error(f"Error handling terms checkboxes: {str(e)}")
        return False

async def find_submit_button(page):
    """Find a form submit button"""
    selectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Apply")',
        'button:has-text("Send")',
        '[role="button"]:has-text("Submit")',
        '[role="button"]:has-text("Apply")',
        'button:has-text("Complete")',
        'button:has-text("Finish")',
        'button:has-text("Next")',
        'button:has-text("Continue")',
        'button.submit-button',
        'button.apply-button',
        'button[class*="submit"]',
        'button[class*="apply"]'
    ]
    
    for selector in selectors:
        try:
            element = await page.query_selector(selector)
            if element:
                is_visible = await element.is_visible()
                is_enabled = await element.is_enabled()
                if is_visible and is_enabled:
                    logger.info(f"Found submit button with selector: {selector}")
                    return element
        except:
            continue
    
    return None

async def fill_form_fields(page, fields, user_data, analysis):
    """Fill identified form fields with user data intelligently"""
    filled_fields = 0
    
    try:
        # First, let's get the current structure of the form
        form_structure = {}
        for field_type, element in fields.items():
            element_id = await element.get_attribute('id') or ''
            element_name = await element.get_attribute('name') or ''
            element_tag = await element.evaluate('el => el.tagName')
            form_structure[field_type] = {
                'id': element_id,
                'name': element_name,
                'tag': element_tag.lower()
            }
        
        logger.info(f"Form structure detected: {json.dumps(form_structure)}")
        
        # Now fill each field with appropriate delay
        for field_type, element in fields.items():
            await page.wait_for_timeout(1000)  # 1 second delay
            
            # Basic fields
            if field_type == "name":
                logger.info("Filling name field...")
                await element.fill(user_data.get('fullName', ''))
                filled_fields += 1
            
            elif field_type == "email":
                logger.info("Filling email field...")
                await element.fill(user_data.get('email', ''))
                filled_fields += 1
            
            elif field_type == "phone":
                logger.info("Filling phone field...")
                # Format phone number consistently
                phone = user_data.get('phone', '')
                # Remove non-numeric characters if present
                phone = re.sub(r'\D', '', phone)
                # Format as XXX-XXX-XXXX if it's 10 digits
                if len(phone) == 10:
                    phone = f"{phone[:3]}-{phone[3:6]}-{phone[6:]}"
                await element.fill(phone)
                filled_fields += 1
            
            elif field_type == "linkedin":
                logger.info("Filling LinkedIn URL...")
                linkedin_url = user_data.get('linkedinUrl', '')
                if not linkedin_url:
                    # Construct a likely LinkedIn URL from the user's name
                    name_parts = user_data.get('fullName', '').lower().split()
                    if len(name_parts) >= 2:
                        linkedin_url = f"https://www.linkedin.com/in/{name_parts[0]}-{name_parts[-1]}"
                    else:
                        linkedin_url = f"https://www.linkedin.com/in/{name_parts[0]}"
                
                await element.fill(linkedin_url)
                filled_fields += 1
            
            elif field_type == "address" or field_type == "location" or field_type == "city":
                logger.info(f"Filling {field_type} field...")
                location = user_data.get('location', '')
                if not location:
                    location = user_data.get('jobSearchPreferences', {}).get('jobPreferences', {}).get('location', '')
                await element.fill(location)
                filled_fields += 1
            
            elif field_type == "experience" or field_type == "current_job" or field_type == "current_position":
                logger.info("Filling work experience...")
                work_experience = user_data.get('workExperience', [])
                if work_experience:
                    most_recent = work_experience[0]
                    position = most_recent.get('position', '')
                    company = most_recent.get('company', '')
                    text = f"{position} at {company}"
                    await element.fill(text)
                    filled_fields += 1
            
            elif field_type == "current_company" or field_type == "employer":
                logger.info("Filling current company...")
                work_experience = user_data.get('workExperience', [])
                if work_experience:
                    company = work_experience[0].get('company', '')
                    await element.fill(company)
                    filled_fields += 1
            
            elif field_type == "cover_letter":
                logger.info("Filling cover letter...")
                if "cover_letter" in analysis:
                    await element.fill(analysis.get("cover_letter", ""))
                else:
                    await element.fill(analysis.get("cover_letter_intro", "") + "\n\n" + 
                                      "I believe my experience and skills align well with the requirements of this position.")
                filled_fields += 1
            
            # Handle dropdown fields with more intelligence
            elif field_type in ["veteran_status", "sponsorship", "work_auth", "race", "pronouns", "over_18"]:
                logger.info(f"Handling {field_type} dropdown...")
                
                # Map field types to likely user data
                field_values = {
                    "veteran_status": user_data.get('veteran', 'No'),
                    "sponsorship": user_data.get('sponsorship', 'No'),
                    "work_auth": user_data.get('workAuth', 'Yes'),
                    "race": user_data.get('race', 'Prefer not to self-identify'),
                    "pronouns": user_data.get('pronouns', 'Prefer not to say'),
                    "over_18": user_data.get('over18', 'Yes')
                }
                
                # Get field value with default
                value = field_values.get(field_type, "Prefer not to say")
                
                # Use the enhanced dropdown selection
                success = await enhanced_dropdown_selection(page, element, value)
                if success:
                    filled_fields += 1
        
        logger.info(f"Successfully filled {filled_fields} fields")
        return filled_fields > 0
    
    except Exception as e:
        logger.error(f"Error filling form fields: {str(e)}")
        return False

async def enhanced_dropdown_selection(page, element, value):
    """Enhanced dropdown selection that handles various dropdown types"""
    try:
        # Check element type
        element_tag = await element.evaluate('el => el.tagName')
        
        # For SELECT elements
        if element_tag.lower() == 'select':
            logger.info(f"Handling standard SELECT dropdown with value: {value}")
            
            # First, try direct option selection
            try:
                await element.select_option(label=value)
                logger.info("Selected by label")
                return True
            except:
                pass
            
            try:
                await element.select_option(value=value)
                logger.info("Selected by value")
                return True
            except:
                pass
            
            # If direct selection fails, examine all options
            options = await element.query_selector_all('option')
            
            # Collect all options for smarter matching
            option_details = []
            for option in options:
                option_text = await option.inner_text()
                option_value = await option.get_attribute('value')
                if option_value and option_text:
                    option_details.append({
                        "element": option,
                        "text": option_text,
                        "value": option_value
                    })
            
            # Try matching by exact or partial text
            for option in option_details:
                if value.lower() == option["text"].lower() or value.lower() in option["text"].lower():
                    await element.select_option(value=option["value"])
                    logger.info(f"Selected option with value {option['value']} (matched text: {option['text']})")
                    return True
            
            # If no match found, choose a sensible default (skip first option if it's empty/Select...)
            if len(option_details) > 1:
                if "select" in option_details[0]["text"].lower() or not option_details[0]["value"]:
                    await element.select_option(value=option_details[1]["value"])
                    logger.info(f"Selected default option: {option_details[1]['text']}")
                else:
                    await element.select_option(value=option_details[0]["value"])
                    logger.info(f"Selected first option: {option_details[0]['text']}")
                return True
                
        # For custom dropdowns
        else:
            logger.info(f"Handling custom dropdown with value: {value}")
            
            # Click to open the dropdown
            await element.click()
            await page.wait_for_timeout(1000)
            
            # Look for dropdown items with various selectors
            dropdown_selectors = [
                f'[role="option"]:has-text("{value}")',
                f'li:has-text("{value}")',
                f'.dropdown-item:has-text("{value}")',
                f'.select-option:has-text("{value}")',
                f'div:has-text("{value}")'
            ]
            
            for selector in dropdown_selectors:
                try:
                    option = await page.wait_for_selector(selector, {asyncio.timeout: 2000})
                    if option:
                        await option.click()
                        logger.info(f"Selected dropdown option using selector: {selector}")
                        await page.wait_for_timeout(500)
                        return True
                except:
                    continue
            
            # If exact match not found, try a more relaxed approach
            try:
                # Find all visible options
                options = await page.query_selector_all('[role="option"], li, .dropdown-item, .select-option')
                
                for option in options:
                    is_visible = await option.is_visible()
                    if not is_visible:
                        continue
                        
                    option_text = await option.inner_text()
                    if value.lower() in option_text.lower():
                        await option.click()
                        logger.info(f"Selected option with partial match: {option_text}")
                        await page.wait_for_timeout(500)
                        return True
                
                # If still no match, click the first visible option that's not empty
                for option in options:
                    is_visible = await option.is_visible()
                    if not is_visible:
                        continue
                        
                    option_text = await option.inner_text()
                    if option_text.strip() and "select" not in option_text.lower():
                        await option.click()
                        logger.info(f"Selected first non-empty option: {option_text}")
                        await page.wait_for_timeout(500)
                        return True
            except Exception as inner_e:
                logger.warning(f"Error during relaxed option selection: {str(inner_e)}")
            
            # If dropdown is open but we couldn't select anything, click elsewhere to close it
            try:
                await page.mouse.click(10, 10)
            except:
                pass
                
        return False
        
    except Exception as e:
        logger.error(f"Error in enhanced dropdown selection: {str(e)}")
        return False

async def handle_resume_upload(page, upload_element, resume_url):
    """Handle uploading the resume file from Firebase Storage path"""
    try:
        logger.info("Starting resume upload process...")
        
        # Download directly from Firebase Storage
        logger.info(f"Downloading resume from Firebase Storage path: {resume_url}")
        temp_file_path = "temp_resume.pdf"
        
        # Fix the bucket access error
        try:
            # Initialize blob here
            blob = bucket.blob(resume_url)
            blob.download_to_filename(temp_file_path)
            logger.info("Resume downloaded successfully")
        except Exception as download_error:
            logger.error(f"Error downloading resume: {str(download_error)}")
            # Try an alternative approach if the first method fails
            try:
                from google.cloud import storage as gcs
                client = gcs.Client()
                bucket_name = storage.bucket().name
                bucket = client.bucket(bucket_name)
                blob = bucket.blob(resume_url)
                blob.download_to_filename(temp_file_path)
                logger.info("Resume downloaded using alternative method")
            except Exception as alt_error:
                logger.error(f"Alternative download method failed: {str(alt_error)}")
                raise
        
        logger.info("Resume downloaded, preparing to upload...")
        await page.wait_for_timeout(2000)  # 2 second delay
        
        # Check if it's a direct file input
        element_tag = await upload_element.evaluate('el => el.tagName')
        
        if element_tag.lower() == 'input':
            # Direct file input
            logger.info("Uploading resume via direct file input...")
            await upload_element.set_input_files(temp_file_path)
        else:
            # It's a button that needs to be clicked to open a file picker
            logger.info("Clicking upload button to open file picker...")
            await upload_element.click()
            await page.wait_for_timeout(2000)  # Wait for file dialog
            
            # Use page.set_input_files which will work with the most recently opened file chooser
            logger.info("Setting file in file picker...")
            await page.set_input_files('input[type="file"]', temp_file_path)
        
        # Clean up the temporary file
        os.remove(temp_file_path)
        logger.info("Resume upload completed successfully")
        return True
    
    except Exception as e:
        logger.error(f"Error uploading resume: {str(e)}")
        return False

async def apply_to_job(url, user_id, job_id, headless=False):
    """Apply to a job posting using Playwright"""
    logger.info(f"Starting application for job {job_id} at {url}")
    
    # Get necessary data
    try:
        job_data = get_job_by_id(job_id)
        user_data = fetch_user_data(user_id)
        
        # Check if job has a resume URL
        resume_url = job_data.get("resume_url")
        if not resume_url:
            logger.error(f"No resume URL found for job {job_id}")
            update_job_status(job_id, ApplicationStatus.FAILED, "Missing resume URL")
            return False, "Missing resume URL"
        
        # Analyze job description for tailored responses
        logger.info("Analyzing job description...")
        job_analysis = analyze_job_description(job_data.get("Description", ""), user_data)
        
        # Generate full cover letter if needed
        logger.info("Generating cover letter...")
        job_analysis["cover_letter"] = generate_cover_letter(job_data, user_data, job_analysis)
    
    except Exception as e:
        logger.error(f"Playwright application failed: {str(e)}")
        
        # Check if the error is CAPTCHA related
        error_str = str(e).lower()
        captcha_error_indicators = ["captcha", "security", "cloudflare", "challenge", "bot detection"]
        is_captcha_error = any(indicator in error_str for indicator in captcha_error_indicators)
        
        if is_captcha_error and DRISSION_AVAILABLE:
            logger.info("Detected CAPTCHA-related error, switching to DrissionPage...")
            
            # Get resume path for DrissionPage
            job_data = get_job_by_id(job_id)
            resume_url = job_data.get("resume_url")
            
            # Download resume to a local file for DrissionPage
            temp_file_path = "temp_resume.pdf"
            bucket = storage.bucket()
            blob = bucket.blob(resume_url)
            blob.download_to_filename(temp_file_path)
            
            # Call DrissionPage fallback
            success, message = await apply_with_drissionpage(url, user_id, job_id, temp_file_path)
            
            # Clean up temp file
            os.remove(temp_file_path)
            
            if success:
                update_job_status(job_id, ApplicationStatus.COMPLETED, "Application completed with DrissionPage")
            else:
                update_job_status(job_id, ApplicationStatus.FAILED, f"DrissionPage failed: {message}")
            
            return success, message
        
        # If not a CAPTCHA error or DrissionPage not available, just report the error
        update_job_status(job_id, ApplicationStatus.FAILED, f"Error: {str(e)}")
        return False, f"Application failed: {str(e)}"
    
    # Launch browser
    async with async_playwright() as p:
        logger.info("Launching browser...")
        browser = await p.chromium.launch(
            headless=headless,
            args=['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
        )
        context = await browser.new_context(
            viewport={"width": 1366, "height": 768},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        page = await context.new_page()
        
        try:
            # Update job status to in progress
            update_job_status(job_id, ApplicationStatus.IN_PROGRESS)
            
            # Visit the job URL with increased timeout
            logger.info(f"Navigating to job URL: {url}")
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                logger.info("Page loaded successfully")
            except Exception as e:
                logger.error(f"Error loading page: {str(e)}")
                raise
            
            await save_screenshot(page, job_id, "initial_page")
            
            # Check for and handle CAPTCHA
            if await detect_and_handle_captcha(page, job_id):
                logger.info("CAPTCHA handling completed, continuing with application...")
            
            # Wait for page to be fully interactive
            await page.wait_for_timeout(3000)
            
            # Identify form fields
            logger.info("Identifying form fields...")
            form_fields = await identify_form_fields(page)
            logger.info(f"Found {len(form_fields)} form fields: {list(form_fields.keys())}")
            
            # Fill identified form fields
            logger.info("Filling form fields...")
            fill_success = await fill_form_fields(page, form_fields, user_data, job_analysis)
            if not fill_success:
                logger.warning("Form filling had issues")
            
            # Take a screenshot of the filled form
            await save_screenshot(page, job_id, "form_filled")
            
            # Find resume upload button
            logger.info("Looking for resume upload button...")
            upload_button = await find_upload_button(page)
            if upload_button:
                logger.info("Found resume upload element")
                upload_success = await handle_resume_upload(page, upload_button, resume_url)
                if not upload_success:
                    logger.warning("Resume upload failed")
            else:
                logger.warning("No resume upload element found")
            
            # Take a screenshot after resume upload
            await save_screenshot(page, job_id, "after_resume_upload")
            
            # Find and handle terms checkboxes
            logger.info("Looking for terms and conditions checkboxes...")
            terms_handled = await find_and_handle_terms_checkboxes(page)
            if terms_handled:
                logger.info("Terms and conditions checkboxes handled")
                await save_screenshot(page, job_id, "after_terms")
            
            # Find and click submit button
            logger.info("Looking for submit button...")
            submit_button = await find_submit_button(page)
            if submit_button:
                logger.info("Found submit button, clicking...")
                await submit_button.click()
                
                # Wait for submission to process
                try:
                    # Wait for either success message or error
                    await page.wait_for_selector('text="Thank you"', timeout=10000)
                    logger.info("Application submitted successfully")
                except:
                    try:
                        await page.wait_for_selector('text="Error"', timeout=5000)
                        logger.warning("Error message detected after submission")
                    except:
                        logger.info("No clear success/error message detected")
                
                await page.wait_for_timeout(5000)  # Additional wait for any final processing
                await save_screenshot(page, job_id, "after_submit")
            else:
                logger.warning("No submit button found")
            
            # Update job status
            update_job_status(job_id, ApplicationStatus.COMPLETED, "Application submitted successfully")
            return True, "Application completed"
            
        except Exception as e:
            logger.error(f"Error during application process: {str(e)}")
            await save_screenshot(page, job_id, "error")
            update_job_status(job_id, ApplicationStatus.FAILED, f"Error: {str(e)}")
            return False, f"Application failed: {str(e)}"
        
        finally:
            await browser.close()

async def run_applications(user_id, headless=False, job_id=None):
    """Process applications for a user - either all jobs or a specific one"""
    try:
        if job_id:
            # Process a single job
            job_data = get_job_by_id(job_id)
            url = job_data.get("URL")
            
            if not url:
                logger.warning(f"No URL found for job {job_id}")
                return
            
            success, message = await apply_to_job(url, user_id, job_id, headless)
            logger.info(f"Job {job_id} application result: {message}")
            
        else:
            # Process all jobs for the user
            jobs = fetch_jobs_for_user(user_id)
            logger.info(f"Found {len(jobs)} jobs for user {user_id}")
            
            for job in jobs:
                job_id = job.get("id")
                url = job.get("URL")
                
                # Skip jobs without URLs or already processed
                if not url:
                    logger.warning(f"Skipping job {job_id} - no URL")
                    continue
                
                if job.get("application_status") == ApplicationStatus.COMPLETED:
                    logger.info(f"Skipping job {job_id} - already completed")
                    continue
                
                # Apply to this job
                success, message = await apply_to_job(url, user_id, job_id, headless)
                logger.info(f"Job {job_id} application result: {message}")
                
                # Wait between applications to avoid overloading
                await asyncio.sleep(5)
                
    except Exception as e:
        logger.error(f"Error in run_applications: {str(e)}")

async def apply_with_drissionpage(url, user_id, job_id, resume_path):
    """Fallback function using DrissionPage instead of Playwright"""
    # Check if DrissionPage is available
    if not DRISSION_AVAILABLE:
        logger.error("DrissionPage not installed - cannot use fallback method")
        return False, "DrissionPage not available"
        
    logger.info("Switching to DrissionPage for CAPTCHA bypass...")
    
    try:
        # Get job and user data
        job_data = get_job_by_id(job_id)
        user_data = fetch_user_data(user_id)
        
        # Create a DrissionPage instance
        page = ChromiumPage()
        
        # Navigate to the URL
        logger.info(f"Navigating to: {url}")
        page.get(url)
        
        # Give time for page to fully load
        page.wait.time(5)
        
        # Take screenshot for verification
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{job_id}_drission_initial_{timestamp}.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        page.save_screenshot(filepath)
        logger.info(f"Screenshot saved: {filepath}")
        
        # Handle basic form fields (simplified)
        logger.info("Filling basic form fields...")
        
        # Name fields
        name_elements = page.eles('tag:input@type="text"')
        for element in name_elements:
            element_id = element.attr('id', '')
            element_name = element.attr('name', '')
            element_placeholder = element.attr('placeholder', '')
            
            combined_text = f"{element_id} {element_name} {element_placeholder}".lower()
            
            if 'name' in combined_text and 'first' not in combined_text and 'last' not in combined_text:
                element.input(user_data.get('fullName', ''))
                logger.info("Filled name field")
                page.wait.time(1)
            elif 'first' in combined_text and 'name' in combined_text:
                first_name = user_data.get('fullName', '').split()[0]
                element.input(first_name)
                logger.info("Filled first name field")
                page.wait.time(1)
            elif 'last' in combined_text and 'name' in combined_text:
                last_name = user_data.get('fullName', '').split()[-1]
                element.input(last_name)
                logger.info("Filled last name field")
                page.wait.time(1)
            elif 'email' in combined_text:
                element.input(user_data.get('email', ''))
                logger.info("Filled email field")
                page.wait.time(1)
            elif 'phone' in combined_text:
                element.input(user_data.get('phone', ''))
                logger.info("Filled phone field")
                page.wait.time(1)
        
        # Try to find and upload resume
        logger.info("Looking for resume upload field...")
        upload_elements = page.eles('tag:input@type="file"')
        
        if upload_elements:
            logger.info(f"Found {len(upload_elements)} upload elements, attempting to upload resume")
            for upload_element in upload_elements:
                try:
                    upload_element.input(resume_path)
                    logger.info("Resume uploaded successfully")
                    page.wait.time(2)
                    break
                except Exception as e:
                    logger.warning(f"Failed to upload resume to element: {str(e)}")
        
        # Take final screenshot
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{job_id}_drission_final_{timestamp}.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        page.save_screenshot(filepath)
        logger.info(f"Final screenshot saved: {filepath}")
        
        # Don't auto-submit, just wait for manual check
        logger.info("Form filled. Waiting for manual verification...")
        page.wait.time(30)
        
        # Close the page
        page.quit()
        
        return True, "DrissionPage application completed"
        
    except Exception as e:
        logger.error(f"Error using DrissionPage: {str(e)}")
        return False, f"DrissionPage failed: {str(e)}"

if __name__ == "__main__":
    # Test parameters
    user_id = "wEApZK7Q96ey5fXYHMZ9kZxGrSX2"
    job_id = "09iL4v4JUj3ONYPbcsfv"
    job_url = "https://jobs.lever.co/teikametrics/df651fc3-1a00-46e0-a094-6a5d1e927b27/apply"
    
    # Add the job to Firestore with resume URL
    job_data = {
        "id": job_id,
        "URL": job_url,
        "resume_url": "resumes/wEApZK7Q96ey5fXYHMZ9kZxGrSX2/resume_wEApZK7Q96ey5fXYHMZ9kZxGrSX2_09iL4v4JUj3ONYPbcsfv_20250430_040546.pdf",
        "user_id": user_id,
        "application_status": "not_started"
    }
    
    # Add job to Firestore
    db.collection("Jobs").document(job_id).set(job_data)
    
    # Run the application in non-headless mode so you can watch
    asyncio.run(apply_to_job(job_url, user_id, job_id, headless=False))