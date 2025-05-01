import { Table, TableStyle, Paragraph, Spacer } from 'reportlab';

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

export const createJobTable = (jobs) => {
  // Create table data
  const tableData = jobs.map(job => ({
    position: job.position,
    dateRange: formatJobTitleAndDate(job.position, job.startDate, job.endDate)
  }));

  return tableData;
};

export const createJobSection = (jobs) => {
  const tableData = createJobTable(jobs);
  
  return {
    title: 'Work Experience',
    jobs: tableData
  };
}; 