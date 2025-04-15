import { useState, useCallback } from "react";
import { TimetableFormData } from "@/utils/timetableUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MinusCircle, PlusCircle, X, Sparkles } from "lucide-react";
import { PREDEFINED_COURSES, PREDEFINED_PROFESSORS } from "@/utils/sampleData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimetableFormProps {
  onGenerate: (data: TimetableFormData) => void;
}

const TimetableForm = ({ onGenerate }: TimetableFormProps) => {
  // Basic form fields
  const [sections, setSections] = useState<string[]>(["A"]);
  const [courses, setCourses] = useState<string[]>([""]);
  const [professors, setProfessors] = useState<{ [course: string]: string }>({});
  const [ltps, setLtps] = useState<{ [course: string]: { L: number; T: number; P: number; S: number } }>({});
  
  // Changed: Single section per course instead of multiple
  const [courseSections, setCourseSections] = useState<{ [courseId: string]: string }>({});
  
  // Days and time slots
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Change from array of strings to array of selected slot IDs
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const availableTimeSlots = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"];
  
  const [maxContinuousHours, setMaxContinuousHours] = useState<number>(2);

  // Course management
  const addCourse = useCallback(() => {
    setCourses(prev => [...prev, ""]);
  }, []);

  const removeCourse = useCallback((index: number) => {
    setCourses(prev => {
      const newCourses = [...prev];
      const removedCourse = newCourses[index];
      newCourses.splice(index, 1);
      
      // Also remove course from section mappings if it exists
      if (removedCourse) {
        setCourseSections(prev => {
          const newMapping = { ...prev };
          delete newMapping[removedCourse];
          return newMapping;
        });
      }
      
      return newCourses;
    });
  }, []);

  const updateCourse = useCallback((index: number, courseId: string) => {
    setCourses(prev => {
      const oldCourseId = prev[index];
      const newCourses = [...prev];
      newCourses[index] = courseId;
      
      // Update course-section mappings if changing an existing course
      if (oldCourseId && courseSections[oldCourseId]) {
        setCourseSections(prev => {
          const newMapping = { ...prev };
          // Transfer section mappings to the new course ID
          newMapping[courseId] = newMapping[oldCourseId];
          delete newMapping[oldCourseId];
          return newMapping;
        });
      }
      
      return newCourses;
    });

    // Auto-populate LTPS from predefined data
    if (courseId && PREDEFINED_COURSES[courseId]) {
      const courseData = PREDEFINED_COURSES[courseId];
      setLtps(prev => ({
        ...prev,
        [courseId]: { 
          L: courseData.L, 
          T: courseData.T, 
          P: courseData.P, 
          S: courseData.S 
        }
      }));
    }
  }, [courseSections]);

  // Changed: Update to set a single section for a course
  const setCourseSection = useCallback((courseId: string, sectionId: string) => {
    if (!courseId) return;
    
    setCourseSections(prev => ({
      ...prev,
      [courseId]: sectionId
    }));
  }, []);

  // Professor management
  const updateProfessor = useCallback((course: string, professor: string) => {
    setProfessors(prev => ({
      ...prev,
      [course]: professor
    }));
  }, []);

  // Section management
  const addSection = useCallback(() => {
    const newSectionId = String.fromCharCode(65 + sections.length); // A, B, C, etc.
    setSections(prev => [...prev, newSectionId]);
  }, [sections]);

  const removeSection = useCallback((index: number) => {
    const sectionToRemove = sections[index];
    
    setSections(prev => prev.filter((_, i) => i !== index));
    
    // Update all course-section mappings that use this section
    setCourseSections(prev => {
      const newMapping = { ...prev };
      Object.keys(newMapping).forEach(courseId => {
        if (newMapping[courseId] === sectionToRemove) {
          delete newMapping[courseId]; // Remove the mapping for this course
        }
      });
      return newMapping;
    });
  }, [sections]);

  const updateSection = useCallback((index: number, value: string) => {
    const oldSectionId = sections[index];
    
    setSections(prev => {
      const newSections = [...prev];
      newSections[index] = value;
      return newSections;
    });
    
    // Update all course-section mappings that use this section
    setCourseSections(prev => {
      const newMapping = { ...prev };
      Object.keys(newMapping).forEach(courseId => {
        if (newMapping[courseId] === oldSectionId) {
          newMapping[courseId] = value;
        }
      });
      return newMapping;
    });
  }, [sections]);

  // Day selection
  const toggleDay = useCallback((day: string) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  }, []);
  
  // Time slot selection
  const toggleTimeSlot = useCallback((slot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  }, []);

  // LTPS management
  const updateLtps = useCallback((course: string, type: "L" | "T" | "P" | "S", value: number) => {
    setLtps(prev => ({
      ...prev,
      [course]: {
        ...prev[course] || { L: 0, T: 0, P: 0, S: 0 },
        [type]: value,
      },
    }));
  }, []);

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty courses
    const filteredCourses = courses.filter(course => course.trim() !== '');
    
    // Create courses by section mapping required by the API
    const coursesBySection: { [section: string]: string[] } = {};
    
    // Initialize empty arrays for each section
    sections.forEach(section => {
      coursesBySection[section] = [];
    });
    
    // Populate with course assignments based on mapping
    filteredCourses.forEach(course => {
      const assignedSection = courseSections[course];
      
      // If course has a section assigned, add it only to that section
      // Otherwise, as a fallback, add to the first section
      const targetSection = assignedSection || sections[0];
      
      if (coursesBySection[targetSection]) {
        coursesBySection[targetSection].push(course);
      }
    });
    
    // Create the form data
    const formData: TimetableFormData = {
      sections,
      courses: coursesBySection,
      professors,
      ltps,
      days: selectedDays,
      time_slots: selectedTimeSlots, 
      max_continuous_hours: maxContinuousHours,
      weekdays: selectedDays,
      timeSlots: selectedTimeSlots.map(id => ({ id, start: id, end: id }))
    };
    
    onGenerate(formData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sections */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Sections</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addSection}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Section
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="flex items-center gap-1 border p-2 rounded-md">
                  <Input
                    value={section}
                    onChange={(e) => updateSection(sectionIndex, e.target.value)}
                    placeholder="Section name"
                    className="w-12"
                  />
                  {sections.length > 1 && (
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(sectionIndex)}
                      className="h-5 w-5 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Courses with section selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Courses</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addCourse}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Course
              </Button>
            </div>
            
            {/* Table header */}
            <div className="grid grid-cols-10 gap-4 mb-2 font-medium">
              <div className="col-span-6">Course</div>
              <div className="col-span-3">Section</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="space-y-2">
              {courses.map((course, courseIndex) => (
                <div key={courseIndex} className="grid grid-cols-10 gap-4 items-center">
                  {/* Course selector - 6 cols */}
                  <div className="col-span-6">
                    <Select 
                      value={course} 
                      onValueChange={(value) => updateCourse(courseIndex, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PREDEFINED_COURSES).map(([id, course]) => (
                          <SelectItem key={id} value={id}>
                            {id} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Section selector - 3 cols */}
                  <div className="col-span-3">
                    {course && (
                      <Select
                        value={courseSections[course] || ""}
                        onValueChange={(value) => setCourseSection(course, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assign section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((section) => (
                            <SelectItem key={section} value={section}>
                              Section {section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  
                  {/* Remove button - 1 col */}
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCourse(courseIndex)}
                      disabled={courses.length <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Professors */}
          &nbsp;
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Professors</Label>
            <div className="space-y-2">
              {courses.filter(course => course.trim() !== '').map((course) => (
                <div key={course} className="flex gap-2 items-center">
                  <span className="w-28">{course}:</span>
                  <Select 
                    value={professors[course] || ""} 
                    onValueChange={(value) => updateProfessor(course, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_PROFESSORS.map((professor) => (
                        <SelectItem key={professor} value={professor}>
                          {professor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
          
          {/* LTPS */}
          &nbsp;
          <div className="space-y-2">
            <Label className="text-lg font-semibold">L T P S Hours</Label>
            <div className="space-y-3">
              {courses.filter(course => course.trim() !== '').map((course) => {
                const courseData = ltps[course] || { L: 0, T: 0, P: 0, S: 0 };
                return (
                  <div key={course} className="flex gap-2 items-center">
                    <span className="w-28">{course}:</span>
                    <div className="flex gap-2 flex-1">
                      <div className="flex-1">
                        {/* <Label className="text-xs">Lecture</Label> */}
                        <Input
                          type="number"
                          min="0"
                          value={courseData.L}
                          onChange={(e) => updateLtps(course, "L", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex-1">
                        {/* <Label className="text-xs">Tutorial</Label> */}
                        <Input
                          type="number"
                          min="0"
                          value={courseData.T}
                          onChange={(e) => updateLtps(course, "T", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex-1">
                        {/* <Label className="text-xs">Practical</Label> */}
                        <Input
                          type="number"
                          min="0"
                          value={courseData.P}
                          onChange={(e) => updateLtps(course, "P", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex-1">
                        {/* <Label className="text-xs">Skill</Label> */}
                        <Input
                          type="number"
                          min="0"
                          value={courseData.S}
                          onChange={(e) => updateLtps(course, "S", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Days - using toggle buttons */}
          &nbsp;
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Days</Label>
            <div className="flex flex-wrap gap-2">
              {availableDays.map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={selectedDays.includes(day) ? "default" : "outline"}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Time Slots - using toggle buttons */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Time Slots</Label>
            <div className="flex flex-wrap gap-2">
              {availableTimeSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={selectedTimeSlots.includes(slot) ? "default" : "outline"}
                  onClick={() => toggleTimeSlot(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Max Continuous Hours */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold" htmlFor="max-continuous">
              Maximum Continuous Hours
            </Label>
            <Input
              id="max-continuous"
              type="number"
              min="1"
              max="6"
              value={maxContinuousHours}
              onChange={(e) => setMaxContinuousHours(parseInt(e.target.value) || 2)}
              className="w-20"
            />
          </div>
          <div className="flex justify-center">
            <Button type="submit" className="w-auto">
              <Sparkles className="h-5 w-5" />
              Generate Timetable
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TimetableForm;