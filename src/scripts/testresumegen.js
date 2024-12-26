// src/scripts/testResumeGeneration.js
import { db } from '../services/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { generateResume } from '../services/resumeGenerator/resumeGenerator.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testResumeGeneration(userId, jobId) {
  try {
    console.log(`Attempting to generate resume for User ID: ${userId}, Job ID: ${jobId}`);

    // Fetch user document to verify data
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error(`No user found with ID: ${userId}`);
    }
    const userData = userDoc.data();

    // Fetch job document
    const jobDocRef = doc(db, 'jobs', jobId);
    const jobDoc = await getDoc(jobDocRef);
    
    if (!jobDoc.exists()) {
      throw new Error(`No job found with ID: ${jobId}`);
    }
    const jobData = jobDoc.data();

    console.log('User Data:', JSON.stringify(userData, null, 2));
    console.log('\nJob Description:', jobData.description);

    // Generate resume
    const { resumeText } = await generateResume(userId, jobId);

    // Save resume to a local file for easy viewing
    const outputDir = join(process.cwd(), 'resume-test-outputs');
    
    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)){
      mkdirSync(outputDir);
    }

    const outputFilePath = join(outputDir, `resume_${userId}_${jobId}_${Date.now()}.txt`);
    
    writeFileSync(outputFilePath, resumeText);

    console.log('\n--- Resume Generated Successfully ---');
    console.log(`Resume saved to: ${outputFilePath}`);
    console.log('\n--- Resume Content ---');
    console.log(resumeText);

    return resumeText;
  } catch (error) {
    console.error('Error in resume generation test:', error);
    throw error;
  }
}

// If this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check for command-line arguments
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node testResumeGeneration.js <userId> <jobId>');
    process.exit(1);
  }

  const [userId, jobId] = args;

  // Run the test
  testResumeGeneration(userId, jobId)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { testResumeGeneration };