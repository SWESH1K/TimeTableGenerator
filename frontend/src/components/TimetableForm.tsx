import { useState } from "react";
import { TimetableFormData } from "@/utils/timetableUtils";
import { PREDEFINED_COURSES, PREDEFINED_PROFESSORS } from "@/utils/sampleData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";

interface TimetableFormProps {
  onGenerate: (data: TimetableFormData) => void;
}

const TimetableForm = ({ onGenerate }: TimetableFormProps) => {
  const [sections, setSections] = useState<string>("");
  const [days, setDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string>("");
  const [maxContinuousHours, setMaxContinuousHours] = useState<number>(2);

  const [courseProfPairs, setCourseProfPairs] = useState<{ courseId: string; professorId: string }[]>([]);
  const [ltps, setLtps] = useState<{ [course: string]: { L: number; T: number; P: number; S: number } }>({});

  const handleAddCourseRow = () => {
    setCourseProfPairs([...courseProfPairs, { courseId: "", professorId: "" }]);
  };

  const handleCourseChange = (index: number, courseId: string) => {
    const updatedPairs = [...courseProfPairs];
    updatedPairs[index] = { ...updatedPairs[index], courseId };
    setCourseProfPairs(updatedPairs);
    
    if (courseId && PREDEFINED_COURSES[courseId]) {
      const { L, T, P, S } = PREDEFINED_COURSES[courseId];
      setLtps(prev => ({
        ...prev,
        [courseId]: { L, T, P, S }
      }));
    }
  };

  const handleProfessorChange = (index: number, professorId: string) => {
    const updatedPairs = [...courseProfPairs];
    updatedPairs[index] = { ...updatedPairs[index], professorId };
    setCourseProfPairs(updatedPairs);
  };

  const handleRemoveCourseRow = (index: number) => {
    const removedCourseId = courseProfPairs[index].courseId;
    const updatedPairs = courseProfPairs.filter((_, i) => i !== index);
    setCourseProfPairs(updatedPairs);
    
    if (removedCourseId && ltps[removedCourseId]) {
      const updatedLtps = { ...ltps };
      delete updatedLtps[removedCourseId];
      setLtps(updatedLtps);
    }
  };

  const handleLtpChange = (courseId: string, field: "L" | "T" | "P" | "S", value: string) => {
    setLtps((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: parseInt(value, 10) || 0,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sections || days.length === 0 || courseProfPairs.length === 0 || timeSlots === "") {
      alert("Please fill all required fields.");
      return;
    }

    const coursesArray = courseProfPairs.map(pair => pair.courseId);
    const professorsMapping: { [course: string]: string } = {};
    courseProfPairs.forEach(pair => {
      if (pair.courseId && pair.professorId) {
        professorsMapping[pair.courseId] = pair.professorId;
      }
    });

    const formData: TimetableFormData = {
      sections: sections.split(",").map(s => s.trim()),
      courses: { A: coursesArray },
      professors: professorsMapping,
      ltps,
      days: days,
      time_slots: timeSlots.split(",").map(s => s.trim()),
      maxContinuousHours,
    };

    onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-card rounded-lg shadow-md border border-border">
      {/* Sections - Improved styling */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Section Name</h2>
        <Input
          type="text"
          placeholder="E.g., A, B, C"
          className="max-w-xs bg-background"
          value={sections}
          onChange={(e) => setSections(e.target.value)}
          required
        />
      </div>

      {/* Days Selector */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Days</h2>
        <div className="flex flex-wrap gap-2">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
            <Button
              type="button"
              key={day}
              variant={days.includes(day) ? "default" : "outline"}
              className={days.includes(day) ? "" : "text-foreground"}
              onClick={() =>
                setDays((prev) =>
                  prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                )
              }
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Courses & Professors</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left text-gray-800 dark:text-gray-200">Course</th>
              <th className="border p-2 text-left text-gray-800 dark:text-gray-200">Professor</th>
              <th className="border p-2"></th>
            </tr>
          </thead>
          <tbody>
            {courseProfPairs.map((pair, index) => (
              <tr key={index}>
                <td className="border p-2">
                  <select
                    value={pair.courseId}
                    onChange={(e) => handleCourseChange(index, e.target.value)}
                    className="select w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    required
                  >
                    <option value="">Select Course</option>
                    {Object.entries(PREDEFINED_COURSES).map(([id, course]) => (
                      <option key={id} value={id}>
                        {id} - {course.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <select
                    value={pair.professorId}
                    onChange={(e) => handleProfessorChange(index, e.target.value)}
                    className="select w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    required
                  >
                    <option value="">Select Professor</option>
                    {PREDEFINED_PROFESSORS.map((professor) => (
                      <option key={professor} value={professor}>
                        {professor}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <button type="button" className="btn btn-danger" onClick={() => handleRemoveCourseRow(index)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="btn btn-secondary" onClick={handleAddCourseRow}>
          Add Course
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">LTPs for Courses</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left text-gray-800 dark:text-gray-200">Course</th>
              <th className="border p-2 text-left text-gray-800 dark:text-gray-200">L</th>
              <th className="border p-2 text-left text-gray-800 dark:text-gray-200">T</th>
              <th className="border p-2 text-left text-gray-800 dark:text-gray-200">P</th>
              <th className="border p-2 text-left text-gray-800 dark:text-gray-200">S</th>
            </tr>
          </thead>
          <tbody>
            {courseProfPairs
              .filter(pair => pair.courseId)
              .map(pair => {
                const courseId = pair.courseId;
                const courseLtp = ltps[courseId] || { L: 0, T: 0, P: 0, S: 0 };
                const courseName = PREDEFINED_COURSES[courseId]?.name || courseId;
                return (
                  <tr key={courseId}>
                    <td className="border p-2 text-gray-800 dark:text-gray-200">{courseId} - {courseName}</td>
                    {(["L", "T", "P", "S"] as const).map((type) => (
                      <td key={type} className="border p-2">
                        <input
                          type="number"
                          min="0"
                          placeholder={type}
                          value={courseLtp[type]}
                          onChange={(e) => handleLtpChange(courseId, type, e.target.value)}
                          className="input w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                          required
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Time Slots - Improved styling */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Time Slots</h2>
        <Input
          type="text"
          placeholder="E.g., T1, T2, T3"
          className="max-w-xs bg-background"
          value={timeSlots}
          onChange={(e) => setTimeSlots(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">Enter comma-separated time slot IDs</p>
      </div>

      {/* Max Continuous Hours - Improved styling */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Max Continuous Hours</h2>
        <Input
          type="number"
          min="1"
          className="max-w-xs bg-background"
          value={maxContinuousHours}
          onChange={(e) => setMaxContinuousHours(parseInt(e.target.value, 10))}
          required
        />
      </div>

      {/* Improved Generate Button */}
      <div className="pt-4">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full md:w-auto px-8 py-6 text-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Sparkles className="h-5 w-5" />
          Generate Timetable
        </Button>
      </div>
    </form>
  );
};

export default TimetableForm;