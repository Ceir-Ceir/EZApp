import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Path to the service account key JSON file
SERVICE_ACCOUNT_PATH = "ezapp-91d8e-firebase-adminsdk-kj65k-1ac11562b6.json"

# Initialize Firebase app
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred, {
    'storageBucket': 'ezapp-91d8e.appspot.com'
})

# Initialize Firestore and Storage
db = firestore.client()
bucket = storage.bucket()

# Helper functions for Firestore operations
def get_users():
    """
    Fetch all users from the Firestore 'users' collection.
    """
    users_ref = db.collection('Users')
    users = users_ref.stream()
    return [user.to_dict() for user in users]

def get_jobs():
    """
    Fetch all jobs from the Firestore 'jobs' collection.
    """
    jobs_ref = db.collection('Jobs')
    jobs = jobs_ref.stream()
    return [job.to_dict() for job in jobs]

def add_job(job_data):
    """
    Add a new job to the Firestore 'jobs' collection.
    """
    jobs_ref = db.collection('jobs')
    jobs_ref.add(job_data)
