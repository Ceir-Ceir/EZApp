import subprocess
import sys
import pkg_resources
import os
from datetime import datetime
import time
import firebase_admin
from firebase_admin import credentials, firestore
import argparse
import json
import pandas as pd
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

# Get the directory where the script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Initialize Firebase if not already initialized
try:
    cred = credentials.Certificate(os.path.join(SCRIPT_DIR, "serviceAccountKey.json"))
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except:
    print("Firebase initialization failed. Make sure serviceAccountKey.json exists.")

def install_required_packages():
    required_packages = {
        'undetected-chromedriver': 'undetected_chromedriver',
        'selenium': 'selenium',
        'pandas': 'pandas',
        'beautifulsoup4': 'bs4'
    }
    
    installed_packages = {pkg.key for pkg in pkg_resources.working_set}
    
    for package, import_name in required_packages.items():
        try:
            __import__(import_name)
            print(f"✓ {package} is already installed")
        except ImportError:
            print(f"Installing {package}...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                print(f"✓ Successfully installed {package}")
            except:
                print(f"Failed to install {package}")
                sys.exit(1)

print("Checking and installing required packages...")
install_required_packages()

def create_output_directory():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = os.path.join(SCRIPT_DIR, f"indeed_jobs_{timestamp}")
    os.makedirs(output_dir, exist_ok=True)
    return output_dir

def save_job_to_csv(job_data, output_file):
    """Save job to a single CSV file"""
    df = pd.DataFrame([job_data])
    
    if not os.path.exists(output_file):
        df.to_csv(output_file, mode='w', index=False, encoding='utf-8')
    else:
        df.to_csv(output_file, mode='a', header=False, index=False, encoding='utf-8')

def read_file_content(filename):
    """Read content from file and clean it"""
    file_path = os.path.join(SCRIPT_DIR, filename)
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()
        return [line.strip() for line in lines if line.strip()]
    except FileNotFoundError:
        print(f"Error: Could not find {filename} in {SCRIPT_DIR}")
        print(f"Please make sure {filename} exists in the same directory as the script.")
        sys.exit(1)

def wait_for_cloudflare(driver):
    """Wait for user to solve Cloudflare challenge"""
    print("\n*** Cloudflare verification detected! ***")
    print("Please solve the verification in the browser.")
    input("Press Enter once you've completed the verification to continue...")
    time.sleep(2)  # Give extra time for page to load after verification

def handle_page_load(driver, url):
    """Handle page loading with Cloudflare detection"""
    driver.get(url)
    time.sleep(3)
    
    # Check for Cloudflare
    if "challenge" in driver.current_url or "cloudflare" in driver.current_url.lower():
        wait_for_cloudflare(driver)
        return True
    return False

def get_job_details(driver, job_url, job_title, city):
    """Get job details with Cloudflare handling"""
    try:
        cloudflare_detected = handle_page_load(driver, job_url)
        if cloudflare_detected:
            print("Resuming after Cloudflare verification...")
        
        time.sleep(2)

        # Initialize variables
        title = company = salary = location = description = "Not specified"

        # Get Title
        try:
            title_elem = driver.find_element(By.CSS_SELECTOR, "h1.jobsearch-JobInfoHeader-title")
            title = title_elem.text.strip()
        except:
            pass

        # Get Company Name
        try:
            company_elems = driver.find_elements(By.CSS_SELECTOR, "[data-company-name='true']")
            if company_elems:
                company = company_elems[0].text.strip()
        except:
            pass

        # Get Salary
        try:
            salary_elem = driver.find_element(By.CSS_SELECTOR, "#salaryInfoAndJobType span.css-19j1a75")
            salary = salary_elem.text.strip()
        except:
            pass

        # Get Location
        try:
            location_elem = driver.find_element(By.CSS_SELECTOR, "[data-testid='inlineHeader-companyLocation']")
            location = location_elem.text.strip()
        except:
            pass

        # Get Job Description
        try:
            desc_elem = driver.find_element(By.CSS_SELECTOR, "#jobDescriptionText")
            description = desc_elem.text.strip()
        except:
            pass

        return {
            'Search_Job_Title': job_title,
            'Search_City': city,
            'Title': title,
            'Company': company,
            'Salary': salary,
            'Location': location,
            'Description': description,
            'URL': job_url
        }

    except:
        return {
            'Search_Job_Title': job_title,
            'Search_City': city,
            'Title': title if 'title' in locals() else "Not specified",
            'Company': company if 'company' in locals() else "Not specified",
            'Salary': salary if 'salary' in locals() else "Not specified",
            'Location': location if 'location' in locals() else "Not specified",
            'Description': description if 'description' in locals() else "Not specified",
            'URL': job_url
        }

def scrape_indeed_jobs(driver, job_title, city, num_pages, output_file):
    """Scrape indeed jobs with Cloudflare handling"""
    try:
        print(f"\nSearching for {job_title} in {city}")
        
        for page in range(num_pages):
            try:
                if page == 0:
                    cloudflare_detected = handle_page_load(driver, "https://www.indeed.com")
                    if cloudflare_detected:
                        print("Resuming initial search...")
                    
                    what_input = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "#text-input-what"))
                    )
                    where_input = driver.find_element(By.CSS_SELECTOR, "#text-input-where")

                    driver.execute_script("arguments[0].value = '';", what_input)
                    driver.execute_script("arguments[0].value = '';", where_input)
                    
                    what_input.send_keys(job_title)
                    where_input.send_keys(city)
                    where_input.send_keys(Keys.RETURN)
                else:
                    url = f"https://www.indeed.com/jobs?q={job_title.replace(' ', '+')}&l={city.replace(' ', '+')}&start={page*10}"
                    cloudflare_detected = handle_page_load(driver, url)
                    if cloudflare_detected:
                        print("Resuming search...")

                time.sleep(3)

                job_cards = WebDriverWait(driver, 10).until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".job_seen_beacon"))
                )

                print(f"Page {page + 1}: Found {len(job_cards)} jobs")

                for index, card in enumerate(job_cards, 1):
                    try:
                        url_elem = card.find_element(By.CSS_SELECTOR, "h2.jobTitle a")
                        job_url = url_elem.get_attribute('href')
                        
                        job_details = get_job_details(driver, job_url, job_title, city)
                        save_job_to_csv(job_details, output_file)
                        
                        print(f"Saved job {index}/{len(job_cards)} - {job_details['Title']}")

                        driver.execute_script("window.history.go(-1)")
                        time.sleep(2)

                    except:
                        continue

            except:
                continue

    except:
        print(f"Error processing {job_title} in {city}")

def parse_args():
    parser = argparse.ArgumentParser(description='Scrape jobs based on user preferences')
    parser.add_argument('--user_id', required=True, help='User ID to scrape jobs for')
    parser.add_argument('--preferences', required=True, help='JSON string of user preferences')
    parser.add_argument('--limit', required=True, help='Maximum number of jobs to scrape')
    return parser.parse_args()

def upload_job_to_firebase(user_id, job_data):
    """Upload a job to Firebase for a specific user"""
    try:
        # Add timestamp and user_id to job data
        job_data['timestamp'] = firestore.SERVER_TIMESTAMP
        job_data['user_id'] = user_id
        job_data['application_status'] = 'not_started'
        
        # Add job to user's jobs collection
        user_jobs_ref = db.collection('users').document(user_id).collection('jobs')
        user_jobs_ref.add(job_data)
        
        print(f"✓ Uploaded job to Firebase for user {user_id}")
        return True
    except Exception as e:
        print(f"Error uploading job to Firebase: {str(e)}")
        return False

def scrape_jobs_for_user(user_id, preferences, limit):
    """
    Scrape jobs for a specific user based on their preferences
    
    Args:
        user_id (str): The user's Firebase ID
        preferences (dict): User preferences containing:
            - job_titles (list): List of job titles to search for
            - locations (list): List of locations to search in
        limit (int): Maximum number of jobs to scrape
    """
    try:
        print(f"\nStarting job scrape for user {user_id}")
        print(f"Preferences: {preferences}")
        print(f"Job limit: {limit}")
        
        # Initialize browser
        options = uc.ChromeOptions()
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        
        driver = uc.Chrome(options=options)
        
        total_jobs_scraped = 0
        jobs_processed = set()
        
        # Process each job title and location combination
        for job_title in preferences.get('job_titles', []):
            for location in preferences.get('locations', []):
                if total_jobs_scraped >= limit:
                    break
                    
                print(f"\nSearching for {job_title} in {location}")
                
                try:
                    # Calculate pages needed based on remaining limit
                    remaining_jobs = limit - total_jobs_scraped
                    pages_needed = min(remaining_jobs // 15 + 1, 5)  # Max 5 pages to avoid too many requests
                    
                    # Create temporary output file
                    temp_output = os.path.join(os.path.dirname(__file__), f"temp_jobs_{user_id}.csv")
                    
                    # Scrape jobs
                    scrape_indeed_jobs(driver, job_title, location, pages_needed, temp_output)
                    
                    # Read scraped jobs and upload to Firebase
                    if os.path.exists(temp_output):
                        df = pd.read_csv(temp_output)
                        for _, job in df.iterrows():
                            if total_jobs_scraped >= limit:
                                break
                                
                            # Create unique job identifier
                            job_id = f"{job['Title']}_{job['Company']}_{job['Location']}"
                            
                            if job_id not in jobs_processed:
                                job_data = job.to_dict()
                                if upload_job_to_firebase(user_id, job_data):
                                    total_jobs_scraped += 1
                                    jobs_processed.add(job_id)
                                    print(f"Progress: {total_jobs_scraped}/{limit} jobs scraped")
                        
                        # Clean up temporary file
                        os.remove(temp_output)
                        
                except Exception as e:
                    print(f"Error processing {job_title} in {location}: {str(e)}")
                    continue
        
        driver.quit()
        print(f"\nCompleted job scraping for user {user_id}")
        print(f"Total jobs scraped: {total_jobs_scraped}")
        
    except Exception as e:
        print(f"Error in scrape_jobs_for_user: {str(e)}")
        if 'driver' in locals():
            driver.quit()

def main():
    args = parse_args()
    
    try:
        # Parse preferences from JSON string
        preferences = json.loads(args.preferences)
        limit = int(args.limit)
        
        # Start job scraping
        scrape_jobs_for_user(args.user_id, preferences, limit)
        
    except Exception as e:
        print(f"Error in main: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
