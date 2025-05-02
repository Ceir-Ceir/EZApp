/**
 * Formats a job title and date range into a readable string
 * @param {string} jobTitle - The job title
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {string} Formatted string
 */
export const formatJobTitleAndDate = (jobTitle, startDate, endDate) => {
  // Format the dates
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const dateRange = formattedStartDate && formattedEndDate 
    ? `${formattedStartDate} to ${formattedEndDate}`
    : formattedStartDate || 'Present';

  return `${jobTitle} — ${dateRange}`;
};

/**
 * Creates formatted job data for display
 * @param {Array} jobs - Array of job objects
 * @returns {Array} Formatted job data
 */
export const createJobTable = (jobs) => {
  if (!Array.isArray(jobs)) return [];
  
  return jobs.map(job => ({
    position: job.position || '',
    dateRange: formatJobTitleAndDate(job.position, job.startDate, job.endDate),
    company: job.company || '',
    description: job.description || ''
  }));
};

/**
 * Creates a formatted job section object
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Formatted job section
 */
export const createJobSection = (jobs) => {
  if (!Array.isArray(jobs)) return { title: 'Work Experience', jobs: [] };
  
  return {
    title: 'Work Experience',
    jobs: createJobTable(jobs)
  };
}; 
