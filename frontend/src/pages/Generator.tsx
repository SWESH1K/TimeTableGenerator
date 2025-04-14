import { useState } from "react";
import Navbar from "@/components/Navbar";
import TimetableForm from "@/components/TimetableForm";
import TimetableDisplay from "@/components/TimetableDisplay";
import { TimetableFormData, Timetable } from "@/utils/timetableUtils";
import axios from "axios";

const Generator = () => {
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [formData, setFormData] = useState<TimetableFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setTimetable(response.data.time_table);
      console.log("Generated timetable:", response.data.time_table);
    } catch (err: any) {
      console.error("API Error:", err.response?.data || err.message);
      setError(`Failed to generate timetable: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
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
          
          {timetable && formData && (
            <div className="mt-12">
              <TimetableDisplay 
                timetable={timetable}
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
