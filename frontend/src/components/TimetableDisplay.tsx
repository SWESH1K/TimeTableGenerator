import { useState, useRef, useMemo } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody,
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { Timetable, TimeSlot, exportToPDF } from "@/utils/timetableUtils";

interface TimetableDisplayProps {
  timetable: Timetable;
  weekdays: string[];
  timeSlots: TimeSlot[];
  section: string; // Add section parameter
}

const TimetableDisplay = ({ timetable, weekdays = [], timeSlots = [], section }: TimetableDisplayProps) => {
  const [exporting, setExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Sort time slots to ensure T1 to T8 order
  const sortedTimeSlots = useMemo(() => {
    return [...timeSlots].sort((a, b) => {
      // Extract numbers from time slot ids (e.g., "T1" -> 1)
      const aNum = parseInt(a.id.replace(/\D/g, ''));
      const bNum = parseInt(b.id.replace(/\D/g, ''));
      return aNum - bNum;
    });
  }, [timeSlots]);
  
  const handleExportPdf = () => {
    setExporting(true);
    try {
      exportToPDF(timetable, weekdays, sortedTimeSlots, section);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Generated Timetable</CardTitle>
          <div className="text-muted-foreground text-sm">
            Your timetable has been generated based on your inputs.
          </div>
        </div>
        
        <div ref={tableRef} className="overflow-auto">
          <Table className="border-collapse border border-border w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="border border-border font-bold text-center bg-muted w-24">Day/Time</TableHead>
                {sortedTimeSlots.map((slot) => (
                  <TableHead 
                    key={slot.id}
                    className="border border-border font-bold text-center bg-muted"
                    style={{ width: `${100 / (sortedTimeSlots.length + 1)}%`, minWidth: "100px" }}
                  >
                    {slot.id}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {weekdays.map((day) => (
                <TableRow key={day}>
                  <TableCell className="font-medium border border-border bg-muted/50">{day}</TableCell>
                  {sortedTimeSlots.map((slot) => {
                    const events = timetable[day]?.[slot.id] || [];
                    return (
                      <TableCell key={slot.id} className="border border-border text-center">
                        {events.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold">{events[0].Course} ({events[0].Type})</div>
                            {/* <div className="text-xs">{events[0].Type}</div> */}
                            <div className="text-xs text-muted-foreground">{events[0].Professor}</div>
                          </div>
                        ) : "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Professor Table */}
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-semibold mb-3">Professors Names</h3>
            <Table className="border-collapse border border-border w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-border font-bold bg-muted">Courses</TableHead>
                  <TableHead className="border border-border font-bold bg-muted">Professor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  // Get unique course-professor pairs from this section's timetable
                  const courseProfessorMap = new Map<string, Set<string>>();
                  
                  // Extract all course-professor pairs but organize by course instead
                  const courseToProf = new Map<string, Set<string>>();
                  
                  Object.values(timetable).forEach(daySlots => {
                    Object.values(daySlots).forEach(events => {
                      events.forEach(event => {
                        if (!courseToProf.has(event.Course)) {
                          courseToProf.set(event.Course, new Set());
                        }
                        courseToProf.get(event.Course)?.add(event.Professor);
                      });
                    });
                  });
                  
                  // Map courses to professors
                  return Array.from(courseToProf.entries()).map(([course, professors], index) => (
                    <TableRow key={index}>
                      <TableCell className="border border-border">{course}</TableCell>
                      <TableCell className="border border-border">
                        {Array.from(professors).join(", ")}
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleExportPdf}
          disabled={exporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TimetableDisplay;
