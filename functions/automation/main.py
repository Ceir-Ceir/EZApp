from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from Job_matcher import match_jobs_to_users
from Resume_Generator import generate_resume
from jobBot import apply_to_job

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# User levels and their monthly job limits
USER_LEVELS = {
    'basic': 100,    # Basic plan
    'pro': 250,      # Pro plan
    'enterprise': 500  # Enterprise plan
}

def calculate_weekly_jobs(monthly_limit):
    return monthly_limit // 4

def get_user_subscription_level(user_data):
    """Get user's subscription level from their data"""
    return user_data.get('planLevel', 'basic')

def assign_weekly_jobs():
    users_ref = db.collection('Users')
    users = users_ref.stream()

    for user in users:
        user_data = user.to_dict()
        
        # Skip users without active subscription
        if user_data.get('subscriptionStatus') != 'active':
            continue
            
        user_level = get_user_subscription_level(user_data)
        monthly_limit = USER_LEVELS.get(user_level, USER_LEVELS['basic'])
        weekly_limit = calculate_weekly_jobs(monthly_limit)

        users_ref.document(user.id).update({
            'weekly_job_limit': weekly_limit,
            'jobs_assigned_this_week': 0,
            'last_assignment_date': datetime.now()
        })

def process_job_matches():
    matches = match_jobs_to_users()

    for user, job in matches:
        user_ref = db.collection('Users').document(user['id'])
        user_data = user_ref.get().to_dict()

        # Skip if user has reached their weekly limit
        if user_data['jobs_assigned_this_week'] >= user_data['weekly_job_limit']:
            continue

        try:
            # Generate resume tailored to the job
            resume_text = generate_resume(user, job)
            resume_path = f"resumes/{user['id']}_{job['id']}.txt"

            with open(resume_path, "w") as f:
                f.write(resume_text)

            # Apply to the job
            success = apply_to_job(job, user, resume_path)

            if success:
                # Update user's job count
                user_ref.update({
                    'jobs_assigned_this_week': firestore.Increment(1),
                    'last_job_application': datetime.now()
                })

                # Update job status
                job_ref = db.collection('Jobs').document(job['id'])
                job_ref.update({
                    'application_status': 'completed',
                    'application_date': datetime.now()
                })

        except Exception as e:
            print(f"Error processing job match for user {user['id']}: {str(e)}")
            continue

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "EZAutomate API running"}), 200

@app.route('/run-automation', methods=['POST'])
def run_automation():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if user_id:
            # Process jobs for specific user
            user_ref = db.collection('Users').document(user_id)
            user_data = user_ref.get().to_dict()
            
            if user_data and user_data.get('subscriptionStatus') == 'active':
                assign_weekly_jobs()
                process_job_matches()
        else:
            # Process jobs for all users
            assign_weekly_jobs()
            process_job_matches()
            
        return jsonify({"status": "success", "message": "Automation process completed."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Required entry point for Cloud Run
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
