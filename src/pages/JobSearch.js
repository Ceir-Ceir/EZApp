import React, { useEffect, useState } from "react";
import Select from "react-select";
import { db } from '../services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

const salaryRangeOptions = [ // salary range options here
  { value: "30-50k", label: "$30,000 - $50,000" },
  { value: "50-70k", label: "$50,000 - $70,000" },
  { value: "70-90k", label: "$70,000 - $90,000" },
  { value: "90-110k", label: "$90,000 - $110,000" },
  { value: "110-130k", label: "$110,000 - $130,000" },
  { value: "130-150k", label: "$130,000 - $150,000" },
  { value: "150k+", label: "$150,000+" }
];

const JobSearch = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState('Save & Find Jobs');
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [panesVisible, setPanesVisible] = useState(true);
  const [jobPreferences, setJobPreferences] = useState({
    jobTitle: "",
    industry: "",
    employmentType: "",
    location: "",
    salaryExpectation: { min: "", max: "" },
  });
  const [skills, setSkills] = useState([]);
  const [software, setSoftware] = useState([{ tool: "", proficiency: "" }]);
  const [additionalInfo, setAdditionalInfo] = useState({
    certifications: [{ name: "", organization: "", issueDate: "", expirationDate: "" }],
    willingToRelocate: "",
    links: "",
  });
  const [jobs, setJobs] = useState([]); // Store fetched jobs
  const [filteredJobs, setFilteredJobs] = useState([]); // Store filtered jobs

  const resetFilters = () => {
    setJobPreferences({
      jobTitle: "",
      industry: "",
      employmentType: "",
      location: "",
      salaryExpectation: { min: "", max: "" },
    });
    setSkills([]); // Clear skills as well
    setSoftware([{ tool: "", proficiency: "" }]); // Clear software list
    setAdditionalInfo({
      certifications: [{ name: "", organization: "", issueDate: "", expirationDate: "" }],
      willingToRelocate: "",
      links: "",
    });
    setFilteredJobs([]); // Clear filtered jobs
    setCurrentStep(1); // Reset to the first step
    setPanesVisible(true);
  };

  // Function to handle adding a new skill
  const handleAddSkill = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      const newSkill = e.target.value.trim();
      setSkills((prevSkills) => {
        // Prevent adding duplicate skills
        if (!prevSkills.includes(newSkill)) {
          return [...prevSkills, newSkill];
        }
        return prevSkills;
      });
      e.target.value = "";
    }
  };

  // Function to remove a skill
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
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

  const auth = getAuth();
  const userId = auth.currentUser?.uid; // Get the authenticated user's ID
  const userEmail = auth.currentUser?.email;

  // Fetch jobs data from Firestore
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobList = querySnapshot.docs.map(doc => doc.data());
        setJobs(jobList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array to fetch jobs once when the component mounts

  useEffect(() => {
    // Filter jobs whenever the jobPreferences, skills, or software change
    const filtered = filterJobs();
    setFilteredJobs(filtered);
  }, [jobPreferences, skills, software, additionalInfo]); // Dependency array to trigger filtering


  const filterJobs = () => {
    let filtered = jobs;
    console.log("Initial Jobs:", jobs);

    if (jobPreferences.jobTitle && typeof jobPreferences.jobTitle === 'string' && jobPreferences.jobTitle.trim() !== '') {
      console.log("Filtering by Job Title:", jobPreferences.jobTitle); // Log the selected job title

      filtered = filtered.filter(job => {
        const jobTitle = job.title ? job.title.toLowerCase().trim() : '';
        const preferenceJobTitle = jobPreferences.jobTitle.toLowerCase().trim();

        console.log("Job title:", jobTitle); // Log job title for debugging
        console.log("Selected job title preference:", preferenceJobTitle); // Log selected job title preference

        return jobTitle.includes(preferenceJobTitle);
      });

    } else {
      console.log("No job title filter applied.");
    }

    if (jobPreferences.industry && typeof jobPreferences.industry === 'string' && jobPreferences.industry.trim() !== '') {
      console.log("Filtering by Industry:", jobPreferences.industry); // Log the selected industry

      filtered = filtered.filter(job => {
        const jobIndustry = job.industry ? job.industry.toLowerCase().trim() : ''; // Ensure it's a valid string and trim spaces
        const preferenceIndustry = jobPreferences.industry.toLowerCase().trim(); // Trim the preference value

        console.log("Job industry:", jobIndustry); // Log job industry for debugging
        console.log("Selected industry preference:", preferenceIndustry); // Log selected industry preference

        return jobIndustry.includes(preferenceIndustry); // Check if the industry is included
      });
    } else {
      console.log("No industry filter applied.");
    }


    if (jobPreferences.employmentType && typeof jobPreferences.employmentType === 'string') {
      console.log("Filtering by Employment Type:", jobPreferences.employmentType);  // Log selected employment type
      filtered = filtered.filter(job => {
        console.log("Job Employment Type:", job.employmentType);  // Log each job's employment type
        return job.employmentType === jobPreferences.employmentType;
      });
      console.log("Jobs after Employment Type filter:", filtered);
    }

    if (jobPreferences.location && typeof jobPreferences.location === 'string') {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(jobPreferences.location.toLowerCase())
      );
    }
    // Filter by salary expectation
    if (jobPreferences.salaryExpectation) {
      console.log("salaryExpectation: ", jobPreferences.salaryExpectation);

      const { min, max } = jobPreferences.salaryExpectation;

      // Check if min and max are provided and valid numbers
      const parsedMin = min && !isNaN(min) ? parseInt(min) : null;
      const parsedMax = max && !isNaN(max) ? parseInt(max) : null;

      console.log("Selected Salary Range:", { min: parsedMin, max: parsedMax });

      if (parsedMin !== null || parsedMax !== null) {
        // Proceed only if at least one boundary is valid
        filtered = filtered.filter((job) => {
          // Ensure salary is parsed as an integer before comparison
          const jobSalary = parseInt(job.salary);

          // Debugging job salary value
          console.log("Job Salary:", job.salary, "Parsed Salary:", jobSalary);

          if (isNaN(jobSalary)) {
            console.log("Invalid salary value for job:", job);
            return false;
          }

          // Check if the job salary is within the selected range
          const isWithinRange =
            (isNaN(parsedMin) || jobSalary >= parsedMin) &&
            (isNaN(parsedMax) || jobSalary <= parsedMax);

          console.log(`Is Job Salary (${jobSalary}) within Range [${parsedMin}, ${parsedMax}]?`, isWithinRange);

          return isWithinRange;
        });
      } else {
        console.log("Invalid salary range. Skipping salary filter.");
      }
    } else {
      console.log("No salary expectation provided. Skipping salary filter.");
    }

    // Filter by skills (if any skills are selected)
    if (skills.length > 0) {
      console.log("Filtering by Skills:", skills); // Log selected skills

      filtered = filtered.filter((job) => {
        // Check if job.skills is an array; if not, split it into an array
        const jobSkills = Array.isArray(job.skills) ? job.skills : job.skills.split(',').map(skill => skill.trim());

        console.log("Job Skills Array:", jobSkills); // Log job skills to see how they're stored

        // Check if every skill in the selected skills list is included in the job skills
        return skills.every(skill => jobSkills.includes(skill.toLowerCase()));
      });
    }


    // Filter by software (if any software is selected)
    if (software.length > 0) {
      console.log("Filtering by software:", software);
      filtered = filtered.filter(job => {
        // If no software field exists in job, exclude only when filter is active
        if (!job.software || job.software.length === 0) {
          console.log("No software listed for this job:", job);
          return true; // Keep this job if no software filter is active
        }

        // Otherwise, check for software match
        const matches = software.every(soft =>
          job.software.some(item =>
            item.tool?.toLowerCase().includes(soft.tool.toLowerCase()) &&
            item.proficiency?.toLowerCase().includes(soft.proficiency.toLowerCase())
          )
        );
        console.log("Job software matches:", matches, job);
        return matches;
      });
    } else {
      console.log("No software filter applied, keeping all jobs with or without software.");
    }


    // Filter by Certifications (if any valid certifications are specified)
    if (additionalInfo.certifications && additionalInfo.certifications.length > 0) {
      filtered = filtered.filter(job => {
        return additionalInfo.certifications.every(cert => {
          // Only apply filtering if both 'name' and 'organization' are non-empty
          if (cert.name && cert.organization) {
            return job.certifications?.some(jobCert =>
              jobCert.name?.toLowerCase().includes(cert.name.toLowerCase()) &&
              jobCert.organization?.toLowerCase().includes(cert.organization.toLowerCase())
            );
          }
          // If the certification is empty, skip filtering
          return true;
        });
      });
    } else {
      console.log("No certifications filter applied, keeping all jobs with or without certifications.");
    }



    // Filter by willing to relocate
    if (additionalInfo.willingToRelocate && typeof additionalInfo.willingToRelocate === 'string') {
      console.log("Filtering by Willing to Relocate:", additionalInfo.willingToRelocate); // Log the willingness to relocate

      // Ensure it's 'yes' (case-insensitive) before filtering
      if (additionalInfo.willingToRelocate.toLowerCase() === 'yes') {
        console.log("Job willing to relocate filter applied.");

        filtered = filtered.filter(job => {
          // Convert string 'false'/'true' to boolean
          const willingToRelocate = job.willingToRelocate === 'true'; // Convert string to boolean

          if (typeof willingToRelocate === 'boolean') {
            return willingToRelocate === true; // Only return jobs where willingToRelocate is true
          } else {
            console.warn("Invalid willingToRelocate value for job:", job);
            return false; // If the value is invalid, exclude this job from the filtered results
          }
        });
      } else {
        console.log("No relocation filter applied.");
      }
    } else {
      console.log("Willing to Relocate filter is not selected or invalid.");
    }



    // Filter by provided links (LinkedIn, portfolio, etc.)
    if (additionalInfo.links && typeof additionalInfo.links === 'string' && additionalInfo.links.trim() !== "") {
      console.log("Filtering by Links:", additionalInfo.links); // Log the links to be filtered by

      filtered = filtered.filter(job => {
        if (Array.isArray(job.links)) {
          const matchFound = job.links.some(link => link.includes(additionalInfo.links.trim()));
          if (matchFound) {
            console.log("Link match found for job:", job.title);
          }
          return matchFound;
        } else {
          console.warn("Job links are not an array for job:", job);
          return false;
        }
      });
    } else {
      console.log("No valid links provided for filtering.");
    }

    // Return the filtered jobs
    console.log("Filtered Jobs:", filtered);
    return filtered;
  };

  const parseRange = (range) => {
    console.log("Range to parse: ", range);

    // If range.min and range.max are numbers, return them directly
    if (typeof range.min === 'number' && typeof range.max === 'number') {
      console.log("Parsed range: ", { min: range.min, max: range.max });
      return { min: range.min, max: range.max };
    }

    if (range.value && typeof range.value === 'string') {
      const [minValue, maxValue] = range.value.split("-");

      // Parse the min value
      const min = minValue.includes("k")
        ? parseInt(minValue.replace("k", "")) * 1000
        : parseInt(minValue) * 1000;

      let max = null;
      if (maxValue) {
        if (maxValue.includes("k")) {
          max = parseInt(maxValue.replace("k", "")) * 1000;
        } else if (maxValue === "150k+") {
          max = Infinity; // Set to a very large number for open-ended ranges
        } else {
          max = parseInt(maxValue) * 1000;
        }
      }

      console.log("Parsed range: ", { min, max });
      return { min, max };
    }

    console.error("Invalid range value. Expected a string or numeric range:", range);
    return { min: null, max: null };
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsButtonClicked(true);
    setButtonText('Finding Jobs...');
    
    // Simulate a delay to show the loading state
    setTimeout(() => {
      setButtonText('Jobs Search Started!');
      setIsSubmitting(false);
    }, 2000);
  };

  const JobPreferencesForm = ({ jobPreferences, setJobPreferences }) => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Title</label>
          <Select
            value={jobPreferences.jobTitle ? { value: jobPreferences.jobTitle, label: jobPreferences.jobTitle } : null}
            onChange={(selected) => setJobPreferences({ ...jobPreferences, jobTitle: selected ? selected.value : '' })}
            options={jobOptions}
            className="mt-1"
            placeholder="Select a job title"
            isClearable
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Location</label>
          <input
            type="text"
            value={jobPreferences.location}
            onChange={(e) => setJobPreferences({ ...jobPreferences, location: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter preferred location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Salary Range</label>
          <Select
            value={jobPreferences.salaryRange ? { value: jobPreferences.salaryRange, label: jobPreferences.salaryRange } : null}
            onChange={(selected) => setJobPreferences({ ...jobPreferences, salaryRange: selected ? selected.value : '' })}
            options={[
              { value: "0-50000", label: "$0 - $50,000" },
              { value: "50000-100000", label: "$50,000 - $100,000" },
              { value: "100000-150000", label: "$100,000 - $150,000" },
              { value: "150000-200000", label: "$150,000 - $200,000" },
              { value: "200000+", label: "$200,000+" }
            ]}
            className="mt-1"
            placeholder="Select salary range"
            isClearable
          />
        </div>
      </div>
    );
  };

  const SkillsAndSoftwareForm = ({ skills, setSkills, software, setSoftware, handleAddSoftware, handleRemoveSoftware }) => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Skills</label>
          <div className="mt-1">
            <input
              type="text"
              value={skills.newSkill}
              onChange={(e) => setSkills({ ...skills, newSkill: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Type a skill and press Enter"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.list.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  <span className="sr-only">Remove skill</span>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Software and Tools</label>
          <div className="mt-1">
            <input
              type="text"
              value={software.newSoftware}
              onChange={(e) => setSoftware({ ...software, newSoftware: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSoftware();
                }
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Type a software/tool and press Enter"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {software.list.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveSoftware(index)}
                  className="ml-2 inline-flex items-center p-0.5 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                >
                  <span className="sr-only">Remove software</span>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AdditionalInfoForm = ({ additionalInfo, setAdditionalInfo, handleAddCertification, handleRemoveCertification }) => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Certifications</label>
          <div className="mt-1 space-y-4">
            {additionalInfo.certifications.map((cert, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={cert.organization}
                    onChange={(e) => {
                      const newCerts = [...additionalInfo.certifications];
                      newCerts[index] = { ...newCerts[index], organization: e.target.value };
                      setAdditionalInfo({ ...additionalInfo, certifications: newCerts });
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Certification Organization"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={cert.issueDate}
                    onChange={(e) => {
                      const newCerts = [...additionalInfo.certifications];
                      newCerts[index] = { ...newCerts[index], issueDate: e.target.value };
                      setAdditionalInfo({ ...additionalInfo, certifications: newCerts });
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Issue Date"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={cert.relevantLink}
                    onChange={(e) => {
                      const newCerts = [...additionalInfo.certifications];
                      newCerts[index] = { ...newCerts[index], relevantLink: e.target.value };
                      setAdditionalInfo({ ...additionalInfo, certifications: newCerts });
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Relevant Link"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span className="sr-only">Remove certification</span>
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCertification}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Certification
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <JobPreferencesForm jobPreferences={jobPreferences} setJobPreferences={setJobPreferences} />;
      case 2:
        return <SkillsAndSoftwareForm skills={skills} setSkills={setSkills} software={software} setSoftware={setSoftware} handleAddSoftware={handleAddSoftware} handleRemoveSoftware={handleRemoveSoftware} />;
      case 3:
        return <AdditionalInfoForm additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo} handleAddCertification={handleAddCertification} handleRemoveCertification={handleRemoveCertification} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Search Preferences</h2>
            <p className="text-gray-600">Tell us about your ideal job and we'll help you find it.</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-24 h-1 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            {currentStep === 3 && (
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                    isButtonClicked
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {buttonText}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
