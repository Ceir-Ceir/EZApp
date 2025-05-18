from Firebase_Setup import db

def get_users():
    users_ref = db.collection('users')
    users = users_ref.stream()
    return [user.to_dict() for user in users]

def get_jobs():
    jobs_ref = db.collection('jobs')
    jobs = jobs_ref.stream()
    return [job.to_dict() for job in jobs]

def match_jobs_to_users():
    users = get_users()
    jobs = get_jobs()
    matched_jobs = []

    for user in users:
        for job in jobs:
            if job['location'] == user['preferences']['location'] and job['title'] in user['preferences']['categories']:
                matched_jobs.append((user, job))
    
    return matched_jobs
