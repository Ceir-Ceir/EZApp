// src/services/resumeGenerator/resumeGenerator.js
import { db, storage } from '../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { tailorExperienceWithAI } from './openAIService.js';
import { HarvardResumeFormatter } from './HarvardResumeFormatter.js';

const processWorkExperience = async (workExperience, jobDescription) => {
  const processedExperience = [];
  
  for (const exp of workExperience) {
    // Split the description into bullet points if it's a single string
    const descriptionBullets = exp.description
      .split('.')
      .map(bullet => bullet.trim())
      .filter(bullet => bullet.length > 0);
    
    // Tailor the bullet points using AI
    const tailoredBullets = await tailorExperienceWithAI(
      descriptionBullets,
      jobDescription
    );

    processedExperience.push({
      company: exp.company,
      location: exp.location || "", // Use location if available
      title: exp.position,
      start_date: new Date(exp.startDate),
      end_date: new Date(exp.endDate),
      description: tailoredBullets
    });
  }
  
  return processedExperience;
};

export const generateResume = async (userId, jobId) => {
  try {
    // Fetch user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    // Fetch job data
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    const jobData = jobDoc.data();

    // Create PersonalInfo object
    const personalInfo = {
      name: userData.name || `${userData.firstName} ${userData.lastName}`,
      street_address: userData.address?.street || "",
      city: userData.address?.city || "",
      state: userData.address?.state || "",
      zip_code: userData.address?.zip || "",
      email: userData.email,
      phone: userData.phone || ""
    };

    // Initialize resume formatter
    const resume = new HarvardResumeFormatter(personalInfo);

    // Add education (if you have education data)
    if (userData.education) {
      userData.education.forEach(edu => {
        resume.addEducation({
          institution: edu.institution,
          location: edu.location || "",
          degree: edu.degree,
          gpa: edu.gpa,
          graduation_date: new Date(edu.graduationDate),
          relevant_coursework: edu.relevantCoursework || [],
          additional_info: edu.additionalInfo || []
        });
      });
    }

    // Process and add work experience
    if (userData.workExperience && userData.workExperience.length > 0) {
      const processedExperience = await processWorkExperience(
        userData.workExperience,
        jobData.description
      );

      processedExperience.forEach(exp => {
        resume.addExperience(exp);
      });
    }

    // Add skills
    if (userData.skills) {
      resume.setSkills({
        technical: userData.skills.technical || [],
        language: userData.skills.languages || [],
        interests: userData.skills.interests || []
      });
    }

    // Generate the resume
    const resumeText = resume.generateResume();

    // Save resume to Firebase Storage
    const filename = `resumes/${userId}_${jobId}_${Date.now()}.txt`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, new Blob([resumeText], { type: 'text/plain' }));

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Update job document with resume URL
    await updateDoc(doc(db, 'jobs', jobId), {
      resumeUrl: downloadURL,
      resumeGenerated: true,
      lastUpdated: new Date()
    });

    return {
      downloadURL,
      resumeText // Return the text as well for preview purposes
    };
  } catch (error) {
    console.error('Error generating resume:', error);
    throw error;
  }
};