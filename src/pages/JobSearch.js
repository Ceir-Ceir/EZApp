import React, { useState } from "react";
import Select from "react-select";

const jobOptions = [ // List of job options
  { value: "Accountant", label: "Accountant" },
  { value: "Actor", label: "Actor" },
  { value: "Actuary", label: "Actuary" },
  { value: "Administrative Assistant", label: "Administrative Assistant" },
  { value: "Aerospace Engineer", label: "Aerospace Engineer" },
  { value: "AI Engineer", label: "AI Engineer" },
  { value: "Agribusiness Manager", label: "Agribusiness Manager" },
  { value: "Agronomist", label: "Agronomist" },
  { value: "Air Traffic Controller", label: "Air Traffic Controller" },
  { value: "Airline Pilot", label: "Airline Pilot" },
  { value: "Allergy Specialist", label: "Allergy Specialist" },
  { value: "Ambulance Driver", label: "Ambulance Driver" },
  { value: "Animator", label: "Animator" },
  { value: "Anthropologist", label: "Anthropologist" },
  { value: "Archaeologist", label: "Archaeologist" },
  { value: "Architect", label: "Architect" },
  { value: "Archivist", label: "Archivist" },
  { value: "Art Director", label: "Art Director" },
  { value: "Assembler", label: "Assembler" },
  { value: "Astronaut", label: "Astronaut" },
  { value: "Astronomer", label: "Astronomer" },
  { value: "Auditor", label: "Auditor" },
  { value: "Auto Mechanic", label: "Auto Mechanic" },
  { value: "Baker", label: "Baker" },
  { value: "Bank Teller", label: "Bank Teller" },
  { value: "Bartender", label: "Bartender" },
  { value: "Behavioral Therapist", label: "Behavioral Therapist" },
  { value: "Biochemist", label: "Biochemist" },
  { value: "Biologist", label: "Biologist" },
  { value: "Biomedical Engineer", label: "Biomedical Engineer" },
  { value: "Blockchain Developer", label: "Blockchain Developer" },
  { value: "Bookkeeper", label: "Bookkeeper" },
  { value: "Brand Ambassador", label: "Brand Ambassador" },
  { value: "Brand Strategist", label: "Brand Strategist" },
  { value: "Brewery Manager", label: "Brewery Manager" },
  { value: "Bus Driver", label: "Bus Driver" },
  { value: "Buyer", label: "Buyer" },
  { value: "Call Center Representative", label: "Call Center Representative" },
  { value: "Campaign Manager", label: "Campaign Manager" },
  { value: "Carpenter", label: "Carpenter" },
  { value: "Cartographer", label: "Cartographer" },
  { value: "Cashier", label: "Cashier" },
  { value: "Chef", label: "Chef" },
  { value: "Chemical Technician", label: "Chemical Technician" },
  { value: "Chemist", label: "Chemist" },
  { value: "Childcare Worker", label: "Childcare Worker" },
  { value: "Chiropractor", label: "Chiropractor" },
  { value: "Civil Engineer", label: "Civil Engineer" },
  { value: "Claims Adjuster", label: "Claims Adjuster" },
  { value: "Clergy", label: "Clergy" },
  { value: "Clinical Data Manager", label: "Clinical Data Manager" },
  { value: "Clinical Psychologist", label: "Clinical Psychologist" },
  { value: "Cloud Architect", label: "Cloud Architect" },
  { value: "Coach", label: "Coach" },
  { value: "College Professor", label: "College Professor" },
  { value: "Composer", label: "Composer" },
  { value: "Computer Programmer", label: "Computer Programmer" },
  { value: "Compliance Analyst", label: "Compliance Analyst" },
  { value: "Compliance Officer", label: "Compliance Officer" },
  { value: "Conservation Scientist", label: "Conservation Scientist" },
  { value: "Construction Manager", label: "Construction Manager" },
  { value: "Consultant", label: "Consultant" },
  { value: "Content Creator", label: "Content Creator" },
  { value: "Content Strategist", label: "Content Strategist" },
  { value: "Copywriter", label: "Copywriter" },
  { value: "Corporate Trainer", label: "Corporate Trainer" },
  { value: "Court Reporter", label: "Court Reporter" },
  { value: "Craftsperson", label: "Craftsperson" },
  { value: "Creative Director", label: "Creative Director" },
  { value: "Customer Service Representative", label: "Customer Service Representative" },
  { value: "Cyber Forensics Specialist", label: "Cyber Forensics Specialist" },
  { value: "Cybersecurity Specialist", label: "Cybersecurity Specialist" },
  { value: "Data Analyst", label: "Data Analyst" },
  { value: "Data Engineer", label: "Data Engineer" },
  { value: "Data Scientist", label: "Data Scientist" },
  { value: "Database Administrator", label: "Database Administrator" },
  { value: "Database Developer", label: "Database Developer" },
  { value: "Delivery Driver", label: "Delivery Driver" },
  { value: "Dentist", label: "Dentist" },
  { value: "Dermatologist", label: "Dermatologist" },
  { value: "DevOps Engineer", label: "DevOps Engineer" },
  { value: "Dietitian", label: "Dietitian" },
  { value: "Digital Marketing Specialist", label: "Digital Marketing Specialist" },
  { value: "Doctor", label: "Doctor" },
  { value: "Drone Pilot", label: "Drone Pilot" },
  { value: "eCommerce Manager", label: "eCommerce Manager" },
  { value: "Economist", label: "Economist" },
  { value: "Ecologist", label: "Ecologist" },
  { value: "Editor", label: "Editor" },
  { value: "Electrical Engineer", label: "Electrical Engineer" },
  { value: "Electrician", label: "Electrician" },
  { value: "Emergency Management Specialist", label: "Emergency Management Specialist" },
  { value: "Emergency Medical Technician", label: "Emergency Medical Technician" },
  { value: "Environmental Engineer", label: "Environmental Engineer" },
  { value: "Environmental Scientist", label: "Environmental Scientist" },
  { value: "Event Coordinator", label: "Event Coordinator" },
  { value: "Event Marketing Specialist", label: "Event Marketing Specialist" },
  { value: "Event Planner", label: "Event Planner" },
  { value: "Executive Assistant", label: "Executive Assistant" },
  { value: "Executive Chef", label: "Executive Chef" },
  { value: "Factory Worker", label: "Factory Worker" },
  { value: "Family Therapist", label: "Family Therapist" },
  { value: "Fashion Buyer", label: "Fashion Buyer" },
  { value: "Fashion Designer", label: "Fashion Designer" },
  { value: "Film Director", label: "Film Director" },
  { value: "Financial Analyst", label: "Financial Analyst" },
  { value: "Financial Auditor", label: "Financial Auditor" },
  { value: "Firefighter", label: "Firefighter" },
  { value: "Flight Attendant", label: "Flight Attendant" },
  { value: "Food Safety Specialist", label: "Food Safety Specialist" },
  { value: "Forensic Expert", label: "Forensic Expert" },
  { value: "Franchise Owner", label: "Franchise Owner" },
  { value: "Fundraising Manager", label: "Fundraising Manager" },
  { value: "Game Designer", label: "Game Designer" },
  { value: "Genetic Counselor", label: "Genetic Counselor" },
  { value: "Geneticist", label: "Geneticist" },
  { value: "Geologist", label: "Geologist" },
  { value: "GIS Specialist", label: "GIS Specialist" },
  { value: "Golf Course Manager", label: "Golf Course Manager" },
  { value: "Grant Writer", label: "Grant Writer" },
  { value: "Graphic Designer", label: "Graphic Designer" },
  { value: "Graphic Artist", label: "Graphic Artist" },
  { value: "Green Building Consultant", label: "Green Building Consultant" },
  { value: "Groundskeeper", label: "Groundskeeper" },
  { value: "Gym Owner", label: "Gym Owner" },
  { value: "Hair Stylist", label: "Hair Stylist" },
  { value: "Hand Therapist", label: "Hand Therapist" },
  { value: "Hardware Developer", label: "Hardware Developer" },
  { value: "Hazardous Materials Specialist", label: "Hazardous Materials Specialist" },
  { value: "Head of Product Design", label: "Head of Product Design" },
  { value: "Heavy Equipment Operator", label: "Heavy Equipment Operator" },
  { value: "Heritage Manager", label: "Heritage Manager" },
  { value: "Historian", label: "Historian" },
  { value: "Home Health Aide", label: "Home Health Aide" },
  { value: "Horticultural Therapist", label: "Horticultural Therapist" },
  { value: "Horticulturist", label: "Horticulturist" },
  { value: "Hotel Clerk", label: "Hotel Clerk" },
  { value: "Hotel Manager", label: "Hotel Manager" },
  { value: "Housekeeper", label: "Housekeeper" },
  { value: "Human Resources Specialist", label: "Human Resources Specialist" },
  { value: "Humanitarian Worker", label: "Humanitarian Worker" },
  { value: "HVAC Technician", label: "HVAC Technician" },
  { value: "Illustrator", label: "Illustrator" },
  { value: "Industrial Designer", label: "Industrial Designer" },
  { value: "Industrial Engineer", label: "Industrial Engineer" },
  { value: "Industrial Hygienist", label: "Industrial Hygienist" },
  { value: "Infographic Designer", label: "Infographic Designer" },
  { value: "Innovation Consultant", label: "Innovation Consultant" },
  { value: "Instrumentation Engineer", label: "Instrumentation Engineer" },
  { value: "Interior Designer", label: "Interior Designer" },
  { value: "Interpreter", label: "Interpreter" },
  { value: "Investment Banker", label: "Investment Banker" },
  { value: "IT Support Specialist", label: "IT Support Specialist" },
  { value: "Jewelry Designer", label: "Jewelry Designer" },
  { value: "Journalist", label: "Journalist" },
  { value: "Judge", label: "Judge" },
  { value: "Judicial Clerk", label: "Judicial Clerk" },
  { value: "Kinesiologist", label: "Kinesiologist" },
  { value: "Labor Economist", label: "Labor Economist" },
  { value: "Laboratory Manager", label: "Laboratory Manager" },
  { value: "Laboratory Technician", label: "Laboratory Technician" },
  { value: "Land Surveyor", label: "Land Surveyor" },
  { value: "Landscape Architect", label: "Landscape Architect" },
  { value: "Language Interpreter", label: "Language Interpreter" },
  { value: "Lawyer", label: "Lawyer" },
  { value: "Legal Editor", label: "Legal Editor" },
  { value: "Legislative Assistant", label: "Legislative Assistant" },
  { value: "Librarian", label: "Librarian" },
  { value: "Lighting Technician", label: "Lighting Technician" },
  { value: "Loan Officer", label: "Loan Officer" },
  { value: "Logistics Coordinator", label: "Logistics Coordinator" },
  { value: "Logistics Manager", label: "Logistics Manager" },
  { value: "Logistics Planner", label: "Logistics Planner" },
  { value: "Loss Prevention Specialist", label: "Loss Prevention Specialist" },
  { value: "Machinist", label: "Machinist" },
  { value: "Maintenance Engineer", label: "Maintenance Engineer" },
  { value: "Maintenance Technician", label: "Maintenance Technician" },
  { value: "Marine Biologist", label: "Marine Biologist" },
  { value: "Market Research Analyst", label: "Market Research Analyst" },
  { value: "Marketing Manager", label: "Marketing Manager" },
  { value: "Marriage Counselor", label: "Marriage Counselor" },
  { value: "Massage Therapist", label: "Massage Therapist" },
  { value: "Materials Engineer", label: "Materials Engineer" },
  { value: "Mathematician", label: "Mathematician" },
  { value: "Mechanical Engineer", label: "Mechanical Engineer" },
  { value: "Mediator", label: "Mediator" },
  { value: "Medical Claims Examiner", label: "Medical Claims Examiner" },
  { value: "Medical Laboratory Technician", label: "Medical Laboratory Technician" },
  { value: "Medical Transcriptionist", label: "Medical Transcriptionist" },
  { value: "Metallurgist", label: "Metallurgist" },
  { value: "Meteorologist", label: "Meteorologist" },
  { value: "Microbiologist", label: "Microbiologist" },
  { value: "Microelectronics Engineer", label: "Microelectronics Engineer" },
  { value: "Military Officer", label: "Military Officer" },
  { value: "Military Strategist", label: "Military Strategist" },
  { value: "Molecular Biologist", label: "Molecular Biologist" },
  { value: "Motion Graphics Artist", label: "Motion Graphics Artist" },
  { value: "Museum Curator", label: "Museum Curator" },
  { value: "Music Producer", label: "Music Producer" },
  { value: "Music Therapist", label: "Music Therapist" },
  { value: "Musician", label: "Musician" },
  { value: "Nanomaterials Scientist", label: "Nanomaterials Scientist" },
  { value: "Nanotechnologist", label: "Nanotechnologist" },
  { value: "Naval Engineer", label: "Naval Engineer" },
  { value: "Network Administrator", label: "Network Administrator" },
  { value: "Network Architect", label: "Network Architect" },
  { value: "Nuclear Medicine Technologist", label: "Nuclear Medicine Technologist" },
  { value: "Nurse", label: "Nurse" },
  { value: "Nutritionist", label: "Nutritionist" },
  { value: "Occupational Health Specialist", label: "Occupational Health Specialist" },
  { value: "Occupational Therapist", label: "Occupational Therapist" },
  { value: "Ocean Engineer", label: "Ocean Engineer" },
  { value: "Oceanographer", label: "Oceanographer" },
  { value: "Oil and Gas Analyst", label: "Oil and Gas Analyst" },
  { value: "Online Community Manager", label: "Online Community Manager" },
  { value: "Operations Analyst", label: "Operations Analyst" },
  { value: "Operations Manager", label: "Operations Manager" },
  { value: "Optometrist", label: "Optometrist" },
  { value: "Orthodontist", label: "Orthodontist" },
  { value: "Orthopedic Surgeon", label: "Orthopedic Surgeon" },
  { value: "Paleontologist", label: "Paleontologist" },
  { value: "Paramedic", label: "Paramedic" },
  { value: "Park Interpreter", label: "Park Interpreter" },
  { value: "Park Ranger", label: "Park Ranger" },
  { value: "Pathologist", label: "Pathologist" },
  { value: "Patent Examiner", label: "Patent Examiner" },
  { value: "Pediatric Nurse", label: "Pediatric Nurse" },
  { value: "Pediatrician", label: "Pediatrician" },
  { value: "Performance Artist", label: "Performance Artist" },
  { value: "Performance Marketing Manager", label: "Performance Marketing Manager" },
  { value: "Pharmacist", label: "Pharmacist" },
  { value: "Pharmacologist", label: "Pharmacologist" },
  { value: "Philosopher", label: "Philosopher" },
  { value: "Phlebotomist", label: "Phlebotomist" },
  { value: "Physical Education Teacher", label: "Physical Education Teacher" },
  { value: "Physical Therapist", label: "Physical Therapist" },
  { value: "Physicist", label: "Physicist" },
  { value: "Pilot", label: "Pilot" },
  { value: "Plumber", label: "Plumber" },
  { value: "Policy Analyst", label: "Policy Analyst" },
  { value: "Police Officer", label: "Police Officer" },
  { value: "Political Scientist", label: "Political Scientist" },
  { value: "Postal Worker", label: "Postal Worker" },
  { value: "Preschool Teacher", label: "Preschool Teacher" },
  { value: "Principal", label: "Principal" },
  { value: "Private Investigator", label: "Private Investigator" },
  { value: "Procurement Specialist", label: "Procurement Specialist" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Production Assistant", label: "Production Assistant" },
  { value: "Production Manager", label: "Production Manager" },
  { value: "Programmer", label: "Programmer" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Property Manager", label: "Property Manager" },
  { value: "Psychiatrist", label: "Psychiatrist" },
  { value: "Public Administrator", label: "Public Administrator" },
  { value: "Public Health Specialist", label: "Public Health Specialist" },
  { value: "Public Relations Specialist", label: "Public Relations Specialist" },
  { value: "Quality Control Inspector", label: "Quality Control Inspector" },
  { value: "Radiologic Technologist", label: "Radiologic Technologist" },
  { value: "Radiologist", label: "Radiologist" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "Recruiter", label: "Recruiter" },
  { value: "Rehabilitation Specialist", label: "Rehabilitation Specialist" },
  { value: "Research Scientist", label: "Research Scientist" },
  { value: "Researcher", label: "Researcher" },
  { value: "Retail Manager", label: "Retail Manager" },
  { value: "Risk Manager", label: "Risk Manager" },
  { value: "Robotics Engineer", label: "Robotics Engineer" },
  { value: "Roofer", label: "Roofer" },
  { value: "Safety Officer", label: "Safety Officer" },
  { value: "Sales Manager", label: "Sales Manager" },
  { value: "School Counselor", label: "School Counselor" },
  { value: "School Librarian", label: "School Librarian" },
  { value: "School Psychologist", label: "School Psychologist" },
  { value: "Scriptwriter", label: "Scriptwriter" },
  { value: "Scrum Master", label: "Scrum Master" },
  { value: "Security Guard", label: "Security Guard" },
  { value: "Set Designer", label: "Set Designer" },
  { value: "Sign Language Interpreter", label: "Sign Language Interpreter" },
  { value: "Social Media Manager", label: "Social Media Manager" },
  { value: "Social Media Strategist", label: "Social Media Strategist" },
  { value: "Social Worker", label: "Social Worker" },
  { value: "Sociologist", label: "Sociologist" },
  { value: "Software Developer", label: "Software Developer" },
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Software Tester", label: "Software Tester" },
  { value: "Sommelier", label: "Sommelier" },
  { value: "Special Education Teacher", label: "Special Education Teacher" },
  { value: "Speech Pathologist", label: "Speech Pathologist" },
  { value: "Statistician", label: "Statistician" },
  { value: "Stock Clerk", label: "Stock Clerk" },
  { value: "Store Associate", label: "Store Associate" },
  { value: "Strategic Planner", label: "Strategic Planner" },
  { value: "Structural Engineer", label: "Structural Engineer" },
  { value: "Substitute Teacher", label: "Substitute Teacher" },
  { value: "Supply Chain Manager", label: "Supply Chain Manager" },
  { value: "Surgeon", label: "Surgeon" },
  { value: "Surveyor", label: "Surveyor" },
  { value: "Sustainability Consultant", label: "Sustainability Consultant" },
  { value: "Systems Administrator", label: "Systems Administrator" },
  { value: "Tax Consultant", label: "Tax Consultant" },
  { value: "Taxidermist", label: "Taxidermist" },
  { value: "Teacher", label: "Teacher" },
  { value: "Technical Analyst", label: "Technical Analyst" },
  { value: "Technical Writer", label: "Technical Writer" },
  { value: "Telecommunication Technician", label: "Telecommunication Technician" },
  { value: "Textile Designer", label: "Textile Designer" },
  { value: "Tour Operator", label: "Tour Operator" },
  { value: "Toxicologist", label: "Toxicologist" },
  { value: "Train Conductor", label: "Train Conductor" },
  { value: "Translator", label: "Translator" },
  { value: "Travel Agent", label: "Travel Agent" },
  { value: "Travel Writer", label: "Travel Writer" },
  { value: "Truck Driver", label: "Truck Driver" },
  { value: "Tutor", label: "Tutor" },
  { value: "Urban Designer", label: "Urban Designer" },
  { value: "Urban Planner", label: "Urban Planner" },
  { value: "UX Designer", label: "UX Designer" },
  { value: "Veterinarian", label: "Veterinarian" },
  { value: "Video Editor", label: "Video Editor" },
  { value: "Video Game Designer", label: "Video Game Designer" },
  { value: "Virtual Assistant", label: "Virtual Assistant" },
  { value: "Visual Merchandiser", label: "Visual Merchandiser" },
  { value: "Waste Management Specialist", label: "Waste Management Specialist" },
  { value: "Water Resource Specialist", label: "Water Resource Specialist" },
  { value: "Weather Forecaster", label: "Weather Forecaster" },
  { value: "Web Administrator", label: "Web Administrator" },
  { value: "Web Developer", label: "Web Developer" },
  { value: "Welder", label: "Welder" },
  { value: "Wildlife Biologist", label: "Wildlife Biologist" },
  { value: "Wind Turbine Technician", label: "Wind Turbine Technician" },
  { value: "Woodworker", label: "Woodworker" },
  { value: "Writer", label: "Writer" },
  { value: "Zoologist", label: "Zoologist" }

  // Add the rest similarly!
].sort((a, b) => a.label.localeCompare(b.label));

const salaryRangeOptions = [ // salary range options here
  { value: "30-50k", label: "$30,000 - $50,000" },
  { value: "50-70k", label: "$50,000 - $70,000" },
  { value: "70-90k", label: "$70,000 - $90,000" },
  { value: "90-110k", label: "$90,000 - $110,000" },
  { value: "110-130k", label: "$110,000 - $130,000" },
  { value: "130-150k", label: "$130,000 - $150,000" },
  { value: "150k+", label: "$150,000+" }
];


const industryOptions = [
  { value: "Healthcare", label: "Healthcare" },
  { value: "Technology", label: "Technology" },
  { value: "Finance", label: "Finance" },
  { value: "Education", label: "Education" },
  { value: "Retail", label: "Retail" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Transportation", label: "Transportation" },
  { value: "Construction", label: "Construction" },
  { value: "Energy", label: "Energy" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Legal Services", label: "Legal Services" },
  { value: "Aerospace", label: "Aerospace" },
  { value: "Government", label: "Government" },
  { value: "Nonprofit", label: "Nonprofit" },
  { value: "Food Services", label: "Food Services" },
  { value: "Automotive", label: "Automotive" }
].sort((a, b) => a.label.localeCompare(b.label));


const JobSearch = () => {
  const [activeStep, setActiveStep] = useState(1); // Tracks the current step
  const [jobPreferences, setJobPreferences] = useState({
    jobTitle: null,
    industry: "",
    employmentType: "",
    location: "",
    salaryExpectation: "",
  });
  const [skills, setSkills] = useState([]);
  const [software, setSoftware] = useState([{ tool: "", proficiency: "" }]);
  const [additionalInfo, setAdditionalInfo] = useState({
    certifications: [{ name: "", organization: "", issueDate: "", expirationDate: "" }],
    willingToRelocate: "",
    links: "",
  });

  const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      console.log("Job Preferences:", jobPreferences);
      console.log("Skills:", skills);
      console.log("Software/Tools:", software);
      console.log("Additional Information:", additionalInfo);
      alert("Form submitted!");
    }
  };

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleAddSoftware = () => {
    setSoftware([...software, { tool: "", proficiency: "" }]);
  };

  const handleRemoveSoftware = (index) => {
    const updatedSoftware = software.filter((_, i) => i !== index);
    setSoftware(updatedSoftware);
  };

  const handleAddCertification = () => {
    setAdditionalInfo({
      ...additionalInfo,
      certifications: [...additionalInfo.certifications, { name: "", organization: "", issueDate: "", expirationDate: "" }],
    });
  };

  const handleRemoveCertification = (index) => {
    const updatedCertifications = additionalInfo.certifications.filter((_, i) => i !== index);
    setAdditionalInfo({ ...additionalInfo, certifications: updatedCertifications });
  };

  const renderForm = () => {
    switch (activeStep) {
      case 1: // Job Preferences
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Job Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
            <Select
              options={jobOptions}
              value={jobPreferences.jobTitle}
              onChange={(selectedOption) =>
                setJobPreferences({ ...jobPreferences, jobTitle: selectedOption })
              }
              placeholder="Select Job Title"
              isSearchable
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
              <Select
                options={industryOptions}
                value={jobPreferences.industry}
                onChange={(selectedOption) =>
                  setJobPreferences({ ...jobPreferences, industry: selectedOption })
                }
                placeholder="Select Preferred Industry"
                isSearchable
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
              <select
                value={jobPreferences.employmentType}
                onChange={(e) => setJobPreferences({ ...jobPreferences, employmentType: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="" disabled>
                  Employment Type
                </option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
              </select>
              <input
                type="text"
                placeholder="Preferred Location"
                value={jobPreferences.location}
                onChange={(e) => setJobPreferences({ ...jobPreferences, location: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <Select
                options={salaryRangeOptions}
                value={jobPreferences.salaryExpectation}
                onChange={(selectedOption) =>
                  setJobPreferences({ ...jobPreferences, salaryExpectation: selectedOption })
                }
                placeholder="Select Salary Range"
                isSearchable
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        );
      case 2: // Skills and Software/Tools
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            <textarea
              placeholder="Enter your skills, separated by commas"
              value={skills.join(", ")}
              onChange={(e) => setSkills(e.target.value.split(",").map((skill) => skill.trim()))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6"
            />
            <h2 className="text-xl font-semibold mb-4">Software/Tools</h2>
            {software.map((entry, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Software/Tool"
                  value={entry.tool}
                  onChange={(e) =>
                    setSoftware(
                      software.map((item, i) => (i === index ? { ...item, tool: e.target.value } : item))
                    )
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                />
                <select
                  value={entry.proficiency}
                  onChange={(e) =>
                    setSoftware(
                      software.map((item, i) => (i === index ? { ...item, proficiency: e.target.value } : item))
                    )
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="" disabled>
                    Proficiency Level
                  </option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <button
                  onClick={() => handleRemoveSoftware(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button onClick={handleAddSoftware} className="text-blue-600 hover:underline">
              + Add Software/Tool
            </button>
          </div>
        );
      case 3: // Additional Information
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            {additionalInfo.certifications.map((cert, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  placeholder="Certification"
                  value={cert.name}
                  onChange={(e) =>
                    setAdditionalInfo({
                      ...additionalInfo,
                      certifications: additionalInfo.certifications.map((item, i) =>
                        i === index ? { ...item, name: e.target.value } : item
                      ),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
                <input
                  type="text"
                  placeholder="Organization"
                  value={cert.organization}
                  onChange={(e) =>
                    setAdditionalInfo({
                      ...additionalInfo,
                      certifications: additionalInfo.certifications.map((item, i) =>
                        i === index ? { ...item, organization: e.target.value } : item
                      ),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
                <input
                  type="text"
                  placeholder="Issue Date"
                  value={cert.issueDate}
                  onChange={(e) =>
                    setAdditionalInfo({
                      ...additionalInfo,
                      certifications: additionalInfo.certifications.map((item, i) =>
                        i === index ? { ...item, issueDate: e.target.value } : item
                      ),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
                <input
                  type="text"
                  placeholder="Expiration Date"
                  value={cert.expirationDate}
                  onChange={(e) =>
                    setAdditionalInfo({
                      ...additionalInfo,
                      certifications: additionalInfo.certifications.map((item, i) =>
                        i === index ? { ...item, expirationDate: e.target.value } : item
                      ),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <button
                  onClick={() => handleRemoveCertification(index)}
                  className="text-red-500 hover:underline mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button onClick={handleAddCertification} className="text-blue-600 hover:underline mb-4">
              + Add Certification
            </button>
            <h2 className="text-xl font-semibold mb-4">Open to Relocation?</h2>
            <div className="flex items-center gap-4">
              <label>
                <input
                  type="radio"
                  name="relocation"
                  value="Yes"
                  checked={additionalInfo.willingToRelocate === "Yes"}
                  onChange={(e) =>
                    setAdditionalInfo({ ...additionalInfo, willingToRelocate: e.target.value })
                  }
                  className="mr-2"
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="relocation"
                  value="No"
                  checked={additionalInfo.willingToRelocate === "No"}
                  onChange={(e) =>
                    setAdditionalInfo({ ...additionalInfo, willingToRelocate: e.target.value })
                  }
                  className="mr-2"
                />
                No
              </label>
            </div>
            <h2 className="text-xl font-semibold mb-4 mt-6">Relevant Links</h2>
            <textarea
              placeholder="Enter any relevant links (e.g., portfolio, LinkedIn)"
              value={additionalInfo.links}
              onChange={(e) =>
                setAdditionalInfo({ ...additionalInfo, links: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left Panel: Steps Navigation */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tell Us About Your Dream Job</h2>
        <ul className="space-y-4">
          <li
            className={`cursor-pointer ${
              activeStep === 1 ? "text-blue-600 font-bold" : "text-gray-600"
            }`}
            onClick={() => setActiveStep(1)}
          >
            1. Job Preferences
          </li>
          <li
            className={`cursor-pointer ${
              activeStep === 2 ? "text-blue-600 font-bold" : "text-gray-600"
            }`}
            onClick={() => setActiveStep(2)}
          >
            2. Skills
          </li>
          <li
            className={`cursor-pointer ${
              activeStep === 3 ? "text-blue-600 font-bold" : "text-gray-600"
            }`}
            onClick={() => setActiveStep(3)}
          >
            3. Additional Information
          </li>
        </ul>
      </div>

      {/* Right Panel: Form Content */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-6">
        {renderForm()}
        <div className="mt-6 flex justify-between">
          {activeStep > 1 && (
            <button
              onClick={handlePrevious}
              className="bg-gray-300 text-black px-4 py-2 rounded-lg"
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {activeStep < 3 ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
