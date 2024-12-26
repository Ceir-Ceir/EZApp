// src/services/resumeGenerator/openAIService.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const tailorExperienceWithAI = async (experienceBullets, jobDescription) => {
  try {
    // Construct a prompt to tailor experience bullets to the job description
    const prompt = `
Job Description:
${jobDescription}

Current Experience Bullets:
${experienceBullets.join('\n')}

Please rewrite these experience bullets to:
1. Highlight skills and achievements most relevant to the job description
2. Use action verbs and quantifiable achievements that show reasonably increased metrics
3. Align closely with the specific key words and requirements in the job posting
4. Maintain the original essence of the experience
5. Keep the number of bullets similar to the original no more than 4 only if really neccessary 

Revised Experience Bullets:
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert resume writer and job application strategist."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    // Extract and split the AI-generated bullets
    const tailoredBullets = response.choices[0].message.content
      .split('\n')
      .map(bullet => bullet.trim())
      .filter(bullet => 
        bullet.length > 0 && 
        !bullet.toLowerCase().includes('revised experience bullets') &&
        !bullet.toLowerCase().includes('please rewrite')
      );

    return tailoredBullets.length > 0 ? tailoredBullets : experienceBullets;
  } catch (error) {
    console.error('Error tailoring experience with AI:', error);
    // Fallback to original bullets if AI fails
    return experienceBullets;
  }
};