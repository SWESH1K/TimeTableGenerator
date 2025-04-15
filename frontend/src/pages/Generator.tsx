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
      const response = await axios.post(`http://localhost:8000/api/generate_timetable/`, apiRequest);
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
              />
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-secondary/30 dark:bg-secondary/10 py-6">
        <div className="container text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} TimetableGen • All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Generator;
