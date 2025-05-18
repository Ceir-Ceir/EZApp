import pandas as pd
from Firebase_Setup import db

def import_jobs(csv_file):
    # Load job data from CSV
    df = pd.read_csv(csv_file)
    
    for _, row in df.iterrows():
        job_data = {
            "title": row["title"],
            "company": row["company"],
            "location": row["location"],
            "description": row["description"],
            "url": row["url"],
            "tags": row["tags"].split(",")  # Assuming tags are comma-separated
        }
        # Add job to Firestore
        db.collection("jobs").add(job_data)
        print(f"Uploaded job: {row['title']} at {row['company']}")

# Specify your CSV file path
csv_file = "path_to_your_jobs_file.csv"
import_jobs(csv_file)
