import { useState } from "react";
import Navbar from "@/components/Navbar";
import TimetableForm from "@/components/TimetableForm";
import TimetableDisplay from "@/components/TimetableDisplay";
import { TimetableFormData, Timetable } from "@/utils/timetableUtils";
import axios from "axios";

// Extended type for multiple sections
type SectionTimetables = {
  [section: string]: Timetable;
};

const Generator = () => {
  const [timetables, setTimetables] = useState<SectionTimetables | null>(null);
  const [formData, setFormData] = useState<TimetableFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleGenerateTimetable = async (data: TimetableFormData) => {
    // Create a properly formatted API request
    const apiRequest = {
      sections: data.sections,
      courses: data.courses,
      professors: data.professors,
      ltps: data.ltps,
      days: data.days,
      time_slots: data.time_slots,
      max_continuous_hours: data.max_continuous_hours || 2 // Ensure this field is sent
    };
    
    // Enhanced data for the frontend display
    const enhancedData = {
      ...data,
      weekdays: data.days,
      timeSlots: data.time_slots.map(slotId => ({
        id: slotId,
        start: slotId,
        end: slotId
      }))
    };
    
    setFormData(enhancedData);
    setLoading(true);
    setError(null);

    try {
      console.log("Sending data to API:", apiRequest); // Log what we're sending
      const response = await axios.post(`/api/generate_timetable/`, apiRequest);
      const sectionTimetables = response.data.time_table;
      setTimetables(sectionTimetables);
      
      // Set the first section as active by default
      if (sectionTimetables && Object.keys(sectionTimetables).length > 0) {
        setActiveSection(Object.keys(sectionTimetables)[0]);
      }
      
      console.log("Generated timetables:", sectionTimetables);
    } catch (err: any) {
      console.error("API Error:", err.response?.data || err.message);
      setError(`Failed to generate timetable: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle section change
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Timetable Generator
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <TimetableForm onGenerate={handleGenerateTimetable} />
          
          {loading && <p className="text-center mt-4">Generating timetable...</p>}
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}
          
          {timetables && formData && activeSection && (
            <div className="mt-12">
              {/* Section Selector */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Select Section:</h2>
                <div className="flex gap-2">
                  {Object.keys(timetables).map(section => (
                    <button
                      key={section}
                      onClick={() => handleSectionChange(section)}
                      className={`px-4 py-2 rounded-md ${
                        activeSection === section
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      Section {section}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Section heading */}
              <h2 className="text-2xl font-bold mb-4 text-center">
                Timetable for Section {activeSection}
              </h2>
              
              {/* Display the timetable for the active section */}
              <TimetableDisplay 
                timetable={timetables[activeSection]}
                weekdays={formData.weekdays}
                timeSlots={formData.timeSlots}
                section={activeSection} // Pass the active section name
              />
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-secondary/30 dark:bg-secondary/10 py-6">
        <div className="container">
          <div className="flex flex-col items-center gap-4">
            
            {/* Contributors Section */}
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium mb-2">Developed by:</p>
              <div className="flex flex-wrap justify-center gap-8">
                {/* Contributor: Lucky Kumar */}
                <div className="flex flex-col items-center">
                  <p className="font-medium">Lucky Kumar</p>
                  <div className="flex gap-2 mt-1">
                    <a 
                      href="https://github.com/lkx100" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                    </a>
                    <a 
                      href="https://linkedin.com/in/lkx100" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                  </div>
                </div>

                {/* Contributor: Sweshik Reddy */}
                <div className="flex flex-col items-center">
                  <p className="font-medium">Sweshik Reddy</p>
                  <div className="flex gap-2 mt-1">
                    <a 
                      href="https://github.com/SWESH1K" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                    </a>
                    <a 
                      href="https://linkedin.com/in/sweshik-reddy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Faculty Advisor */}
            <div className="mt-2 text-sm text-center">
              <p>Under the guidance of <span className="font-medium">Dr. Sudharshan Babu</span></p>
            </div>
            <p className="text-muted-foreground">
                © {new Date().getFullYear()} TimetableGen • All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Generator;
