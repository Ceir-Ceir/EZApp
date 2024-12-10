import subprocess
import sys
import pkg_resources
import os
from datetime import datetime
import time
import pandas as pd
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys


def install_required_packages():
    """Ensure required packages are installed."""
    required_packages = {
        'undetected-chromedriver': 'undetected_chromedriver',
        'selenium': 'selenium',
        'pandas': 'pandas',
        'beautifulsoup4': 'bs4'
    }
    installed_packages = {pkg.key for pkg in pkg_resources.working_set}

    for package, import_name in required_packages.items():
        if package not in installed_packages:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])


print("Checking and installing required packages...")
install_required_packages()


def create_output_directory():
    """Create a timestamped output directory."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = f"indeed_jobs_{timestamp}"
    os.makedirs(output_dir, exist_ok=True)
    return output_dir


def save_job_to_csv(job_data, output_file):
    """Save job details to a CSV file."""
    df = pd.DataFrame([job_data])
    if not os.path.exists(output_file):
        df.to_csv(output_file, mode='w', index=False, encoding='utf-8')
    else:
        df.to_csv(output_file, mode='a', header=False, index=False, encoding='utf-8')


def read_file_content(filename):
    """Read job titles or city names from a file."""
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            return [line.strip() for line in file if line.strip()]
    except FileNotFoundError:
        print(f"File {filename} not found.")
        sys.exit(1)


def get_job_details(driver, job_url, job_title, city):
    """Extract job details from the job page."""
    driver.get(job_url)
    time.sleep(2)

    def extract_data(selector):
        try:
            return driver.find_element(By.CSS_SELECTOR, selector).text.strip()
        except Exception:
            return "Not specified"

    return {
        'Search_Job_Title': job_title,
        'Search_City': city,
        'Title': extract_data("h1.jobsearch-JobInfoHeader-title"),
        'Company': extract_data("[data-company-name='true']"),
        'Salary': extract_data("#salaryInfoAndJobType span.css-19j1a75"),
        'Location': extract_data("[data-testid='inlineHeader-companyLocation']"),
        'Description': extract_data("#jobDescriptionText"),
        'URL': job_url
    }


def scrape_indeed_jobs(driver, job_title, city, num_pages, output_file):
    """Scrape jobs from Indeed for the given job title and city."""
    print(f"\nScraping jobs for {job_title} in {city}...")

    for page in range(num_pages):
        try:
            if page == 0:
                driver.get("https://www.indeed.com")
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "#text-input-what"))
                ).send_keys(job_title)

                where_input = driver.find_element(By.CSS_SELECTOR, "#text-input-where")
                where_input.clear()
                where_input.send_keys(city)
                where_input.send_keys(Keys.RETURN)
            else:
                url = f"https://www.indeed.com/jobs?q={job_title.replace(' ', '+')}&l={city.replace(' ', '+')}&start={page * 10}"
                driver.get(url)

            time.sleep(2)
            job_cards = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".job_seen_beacon"))
            )

            print(f"Page {page + 1}: Found {len(job_cards)} jobs.")

            for card in job_cards:
                try:
                    job_url = card.find_element(By.CSS_SELECTOR, "h2.jobTitle a").get_attribute('href')
                    job_details = get_job_details(driver, job_url, job_title, city)
                    save_job_to_csv(job_details, output_file)
                except Exception as e:
                    print(f"Error processing job card: {e}")

        except Exception as e:
            print(f"Error scraping page {page + 1}: {e}")


def main():
    """Main function to initiate scraping."""
    print("\n=== Indeed Job Scraper ===\n")

    job_titles = read_file_content("job_title.txt")
    cities = read_file_content("cities.txt")
    num_pages = int(input("Enter the number of pages to scrape (1 page ≈ 15 jobs): "))

    output_dir = create_output_directory()
    output_file = os.path.join(output_dir, "indeed_jobs.csv")

    options = uc.ChromeOptions()
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')

    driver = uc.Chrome(options=options)

    try:
        for job_title in job_titles:
            for city in cities:
                scrape_indeed_jobs(driver, job_title, city, num_pages, output_file)
                time.sleep(1)  # Prevent overloading the server
    except KeyboardInterrupt:
        print("\nScraping interrupted by user.")
    finally:
        driver.quit()
        print(f"\nScraping completed. Data saved to {output_file}.")


if __name__ == "__main__":
    main()
