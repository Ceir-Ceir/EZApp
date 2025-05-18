import React from 'react';
import { createJobTable } from '../utils/jobFormatter.js';

const JobHistoryTable = ({ jobs }) => {
  if (!jobs || jobs.length === 0) {
    return <p>No work experience to display</p>;
  }

  const formattedJobs = createJobTable(jobs);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Range
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {formattedJobs.map((job, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {job.position}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {job.dateRange}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobHistoryTable; 