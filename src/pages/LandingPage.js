// src/pages/LandingPage
import React, { useEffect, useState } from 'react'; // Add useState import
import { Link } from 'react-router-dom';
import { PencilIcon, AdjustmentsHorizontalIcon, ArrowPathIcon, BriefcaseIcon } from "@heroicons/react/24/outline"; // Example icons

const LandingPage = () => {
    // Add state at component level, not inside useEffect
    const [isStripeLoaded, setIsStripeLoaded] = useState(false);

    useEffect(() => {
        // Smooth scroll functionality
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Stripe script loading
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;
        script.onload = () => setIsStripeLoaded(true);
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);
    
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="w-full h-20 bg-white flex justify-between items-center px-8 border-b border-gray-200">
                {/* Logo */}
                <div className="text-2xl font-bold">
                    <img src="/images/logoez.png" alt="EZ Apply Logo" className="h-28 w-auto" />
                </div>
                
                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
                    <a href="#features" className="hover:text-blue-500">AI Features</a>
                    <a href="#pricing" className="hover:text-blue-500">Pricing</a>
                </nav>
                
                {/* Try Now Button */}
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Try Now
                </Link>
            </header>
        
            {/* Hero Section */}
<div className="relative w-full pt-12 pb-4 px-4"> {/* Reduced padding top and bottom */}
    <div className="max-w-7xl mx-auto">
        {/* Social Proof - Above everything */}
        <div className="flex justify-center items-center gap-4 mb-8"> {/* Reduced margin bottom */}
            <div className="flex -space-x-2">
                <img src="/images/av1.jpeg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="/images/av2.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="/images/av3.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="/images/av4.jpeg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="/images/av5.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="/images/av6.jpeg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
            </div>
            <span className="text-gray-600">20k+</span>
            <div className="flex text-yellow-400">★★★★★</div>
        </div>
    </div>
</div>

{/* Main Content with Email Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative max-w-6xl mx-auto -mt-4">
    {/* Left Email Card */}
    <div className="hidden md:block relative">
        <div className="transform scale-75 origin-top-left"> {/* Scale down by 25% */}
            <div className="w-[280px] bg-white rounded-xl shadow-lg border border-gray-200 p-4 transform rotate-3">
                <h4 className="text-xs text-gray-700 font-semibold mb-2">New email</h4>
                <div className="text-xs text-gray-700 mb-2">To: <span className="font-semibold">hr@company.co</span></div>
                <div className="text-xs text-gray-700 mb-2">Subject: Checking In on CEO Application</div>
                <p className="text-xs text-gray-600 mt-4 leading-tight">
                    Hi John, <br />
                    Hope this email finds you well! Just a friendly ping on my application for the CEO position at AIApply.
                    Given my background with SpaceX and passion for space exploration, I believe I could bring some unique
                    perspectives to the table. It's not every day you get an application from someone who's sent a car to orbit Mars, right? 😉
                </p>
                <p className="text-xs text-gray-600 mt-2">Cheers, <br /> Elon</p>
            </div>
        </div>
    </div>

    {/* Center Content */}
    <div className="flex justify-center items-center w-full py-4 col-span-1">
        <div className="text-center flex flex-col items-center max-w-full px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 whitespace-nowrap">
                Automate Your Job Search
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 whitespace-nowrap">
                Apply to MORE Jobs Effortlessly
            </h2>
            <p className="text-gray-600 text-xl md:text-2xl mb-8 whitespace-nowrap">
                Your job search shouldn't be a job.
            </p>
            <Link 
                to="/login" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>
        </div>
    </div>

    {/* Right Email Card */}
    <div className="hidden md:block relative">
        <div className="transform scale-75 origin-top-right"> {/* Scale down by 25% */}
            <div className="w-[280px] bg-gray-100 rounded-xl shadow-lg border border-gray-200 p-4 transform -rotate-2 ml-auto">
                <h4 className="text-xs text-gray-700 font-semibold mb-2">Dear HR Manager,</h4>
                <p className="text-xs text-gray-600 mt-2 leading-tight">
                    I'm reaching out about the engineering gig at AIApply. You're looking for an innovator and boundary-pusher in tech. Well, guess what? That's exactly my jam.
                    <br /><br />
                    You might've heard of a little company called SpaceX. As the CEO and lead designer, I turned the aerospace industry on its head. Reusable rockets? Commercial trips to Mars? That was all me.
                </p>
                <p className="text-xs text-gray-600 mt-2">Best, <br /> Elon</p>
            </div>
        </div>
    </div>
</div>
            {/* Company Logos Section */}
            <div className="w-full py-12 bg-gray-50 -mt-12">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-gray-500 uppercase mb-8">Get Hired at Top Companies Worldwide</p>
                    <div className="flex justify-center items-center gap-12 flex-wrap">
                        <img src="/images/corplogos/job1.jpeg" alt="Brand" className="h-24 w-auto opacity-80" />
                        <img src="/images/corplogos/job6.jpeg" alt="Brand" className="h-24 w-auto opacity-80" />
                        <img src="/images/corplogos/job3.jpeg" alt="Brand" className="h-16 w-auto opacity-80" />
                        <img src="/images/corplogos/job4.jpeg" alt="Brand" className="h-24 w-auto opacity-80" />
                        <img src="/images/corplogos/job7.png" alt="Brand" className="h-24 w-auto opacity-80" />
                        <img src="/images/corplogos/job8.png" alt="Brand" className="h-24 w-auto opacity-80" />
                        <img src="/images/corplogos/job9.png" alt="Brand" className="h-24 w-auto opacity-80" />
                    </div>
                </div>
            </div>

                    {/* How It Works Section */}
                    <section id="how-it-works" className="bg-gray-100 py-12">
                        <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md w-full md:w-1/4">
                            <PencilIcon className="h-12 w-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Step 1: Fill Out Your Info</h3>
                            <p className="text-gray-600">
                                Provide the same details you'd normally include on a job application.
                            </p>
                            </div>
                            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md w-full md:w-1/4">
                            <AdjustmentsHorizontalIcon className="h-12 w-12 text-green-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Step 2: Choose Preferences</h3>
                            <p className="text-gray-600">
                                Select your desired job title, location, salary, and other preferences.
                            </p>
                            </div>
                            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md w-full md:w-1/4">
                            <ArrowPathIcon className="h-12 w-12 text-yellow-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Step 3: Start Your Search</h3>
                            <p className="text-gray-600">
                                We find jobs daily, tailor your resume, and apply for you automatically.
                            </p>
                            </div>
                            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md w-full md:w-1/4">
                            <BriefcaseIcon className="h-12 w-12 text-purple-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Step 4: Get Hired</h3>
                            <p className="text-gray-600">
                                Prepare for interviews or update your job search details anytime.
                            </p>
                            </div>
                        </div>
                        </div>
                    </section>

            {/* Features Section */}
            <div id="features" className="w-full py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm mb-4">
                            Features
                        </div>
                        <h2 className="text-4xl font-bold mb-4">EZApply Product Features</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            From applying to tracking to preparing for interviews, EZApply simplifies every step of the job hunt, so you can focus on landing the role that's right for you.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* AI Job Search */}
                        <div className="flex flex-col items-center text-center bg-[#f8f9fa] rounded-3xl p-8">
                            <div className="w-[72px] h-[72px] bg-[#004aad] rounded-3xl flex items-center justify-center mb-6">
                            <div className="w-[72px] h-[72px] bg-gradient-to-r from-blue-500 to-blue-300 rounded-full flex items-center justify-center mb-6">
                                <img className="w-[45px] h-[45px]" src="/images/intelligence.png" alt="AI Icon" />
                            </div>

                            </div>
                            <h3 className="text-black text-2xl font-medium font-['SF Pro Display'] mb-4">
                                AI Job Search
                            </h3>
                            <p className="text-neutral-500 text-base font-normal font-['SF Pro Display']">
                                Our AI finds new jobs for YOU daily and applies directly to them automatically saving you hours of searching
                            </p>
                        </div>

                        {/* AI Resumes & Cover Letters */}
                        <div className="flex flex-col items-center text-center bg-[#f8f9fa] rounded-3xl p-8">
                            <div className="w-[72px] h-[72px] bg-[#004aad] rounded-3xl flex items-center justify-center mb-6">
                                <div className="w-[72px] h-[72px] bg-gradient-to-r from-blue-500 to-blue-300 rounded-full flex items-center justify-center mb-6">
                                    <img className="w-[45px] h-[45px]" src="/images/human-resources.png" alt="AI Icon" />
                                </div>
                            </div>
                            <h3 className="text-black text-2xl font-medium font-['SF Pro Display'] mb-4">
                                AI Resumes & Cover Letters
                            </h3>
                            <p className="text-neutral-500 text-base font-normal font-['SF Pro Display']">
                                Simply tell us your normal application info and our AI will match your experience to fit keywords based on each job description
                            </p>
                        </div>

                        {/* Smart Search System */}
                        <div className="flex flex-col items-center text-center bg-[#f8f9fa] rounded-3xl p-8">
                            <div className="w-[72px] h-[72px] bg-[#004aad] rounded-3xl flex items-center justify-center mb-6">
                                <div className="w-[72px] h-[72px] bg-gradient-to-r from-blue-500 to-blue-300 rounded-full flex items-center justify-center mb-6">
                                <img className="w-[45px] h-[45px]" src="/images/feedback.png" alt="AI Icon" />
                            </div>
                            </div>
                            <h3 className="text-black text-2xl font-medium font-['SF Pro Display'] mb-4">
                                Smart Search System
                            </h3>
                            <p className="text-neutral-500 text-base font-normal font-['SF Pro Display']">
                                Like or dislike jobs you've applied to and our AI will adjust to your preference and find you the perfect fit
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="w-full py-24 bg-[#f8f9fc]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col items-center text-center mb-16">
                        <div className="bg-blue-600 text-white px-6 py-2 rounded-full mb-6">
                            Trusted by 20,000+ clients
                        </div>
                        <h2 className="text-4xl font-bold mb-6">
                            What Our Client Think About Us?
                        </h2>
                    </div>

                    {/* Testimonials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Testimonial Card 1 */}
                        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-4">
                                <img src="/images/av1.jpeg" alt="User" className="w-16 h-16 rounded-full object-cover" />
                                <div className="flex text-yellow-400">★★★★★</div>
                            </div>
                            <p className="text-gray-600 mb-4">
                                I used to spend hours each day filling out applications, but this service changed everything! Now, I just tell it what I'm looking for, and it finds jobs and applies for me automatically. It even handles CAPTCHA challenges, which is a huge time-saver.
                            </p>
                            <div className="text-right mt-auto">
                                <h4 className="text-gray-900 font-semibold">EzApply User- Jack Woodson</h4>
                            </div>
                        </div>

                        {/* Testimonial Card 2 */}
                        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-4">
                                {/* Testimonial Card 2 (continued) */}
                                <img src="/images/av3.jpg" alt="User" className="w-16 h-16 rounded-full object-cover" />
                                <div className="flex text-yellow-400">★★★★★</div>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Applying to jobs is a job in itself, but this service has taken the burden off my shoulders. I set my preferences, and it scrapes the web to find perfect matches, tailoring each application to the job.
                            </p>
                            <div className="text-right mt-auto">
                                <h4 className="text-gray-900 font-semibold">EzApply User- Camille Clemmons</h4>
                            </div>
                        </div>

                        {/* Testimonial Card 3 */}
                        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-4">
                                <img src="/images/av4.jpeg" alt="User" className="w-16 h-16 rounded-full object-cover" />
                                <div className="flex text-yellow-400">★★★★★</div>
                            </div>
                            <p className="text-gray-600 mb-4">
                                I can't believe how many applications it sends out on my behalf. The CAPTCHA bypass feature is amazing—no more getting stuck on tricky forms! I love that I can just focus on preparing for interviews rather than applying over and over.
                            </p>
                            <div className="text-right mt-auto">
                                <h4 className="text-gray-900 font-semibold">EzApply User- Leslie Clark</h4>
                            </div>
                        </div>

                        {/* Testimonial Card 4 */}
                        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-4">
                                <img src="/images/av6.jpeg" alt="User" className="w-16 h-16 rounded-full object-cover" />
                                <div className="flex text-yellow-400">★★★★★</div>
                            </div>
                            <p className="text-gray-600 mb-4">
                                This service does all the heavy lifting. From finding jobs that fit my criteria to automatically sending applications, it's like having a virtual assistant for my job search.
                            </p>
                            <div className="text-right mt-auto">
                                <h4 className="text-gray-900 font-semibold">EzApply User- Simon McGregor</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="w-full py-24 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Find the Perfect Plan for You</h2>
                <p className="text-gray-600 text-lg">
                Wherever you are in your job search, we have a plan that suits your needs.
                </p>
            </div>
            <div className="max-w-7xl mx-auto">
                <div
                dangerouslySetInnerHTML={{
                    __html: `
                    <stripe-pricing-table 
                        pricing-table-id="prctbl_1QKsvxK15hFjPN4iIj6XoBYS"
                        publishable-key="pk_test_51QJhxLK15hFjPN4iALvmbUuaKxuNE3pthjbKBxNmKO5nrOxXNxgDs5KPxPSrCebcRL59697NZppmi2RTprQCibl000uyb5mhWP">
                    </stripe-pricing-table>
                    `,
                }}
                />
            </div>
            </div>


            {/* Footer */}
            <footer className="w-full bg-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                        <img src="/images/logoez.png" alt="EZ Apply Logo" className="h-24" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 text-gray-600 text-sm">
                        <a href="#" className="hover:text-blue-500">Privacy Policy</a>
                        <span className="hidden md:inline text-gray-400">|</span>
                        <a href="#" className="hover:text-blue-500">Terms & Conditions</a>
                        <span className="text-gray-500">© 2024 EZApply</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;