import { useState, useRef } from "react";
import { Download, FileSpreadsheet, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timetable, TimeSlot, exportToExcel, exportToPDF, exportToPNG } from "@/utils/timetableUtils";

interface TimetableDisplayProps {
  timetable: Timetable;
  weekdays: string[];
  timeSlots: TimeSlot[];
}

const TimetableDisplay = ({ timetable, weekdays = [], timeSlots = [] }: TimetableDisplayProps) => {
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "png">("excel");
  const tableRef = useRef<HTMLDivElement>(null);
  
  console.log("Timetable in display:", timetable);
  console.log("Weekdays:", weekdays);
  console.log("TimeSlots:", timeSlots);

  const handleExport = () => {
    if (exportFormat === "excel") {
      exportToExcel(timetable, weekdays, timeSlots);
    } else if (exportFormat === "pdf") {
      exportToPDF(timetable, weekdays, timeSlots);
    } else if (exportFormat === "png" && tableRef.current) {
      exportToPNG(tableRef.current);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Timetable</CardTitle>
        <CardDescription>
          Your timetable has been generated based on your inputs.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-full" ref={tableRef}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-muted text-left">Day/Time</th>
                {timeSlots.map(slot => (
                  <th key={slot.id} className="p-2 border bg-muted text-center">
                    {slot.id} {/* Just display the time slot ID */}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekdays.map(day => (
                <tr key={day}>
                  <td className="p-2 border font-medium">{day}</td>
                  {timeSlots.map(slot => {
                    const events = timetable[day]?.[slot.id] || [];
                    // Get only the first event for each cell
                    const event = events.length > 0 ? events[0] : null;
                    
                    return (
                      <td key={`${day}-${slot.id}`} className="p-2 border align-top">
                        {event ? (
                          <div className="p-1 rounded bg-primary/10">
                            <div className="font-semibold">{event.Course} ({event.Type})</div>
                            <div className="text-xs text-muted-foreground">{event.Professor}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Select
            value={exportFormat}
            onValueChange={(value) => setExportFormat(value as "excel" | "pdf" | "png")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel</span>
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </div>
              </SelectItem>
              <SelectItem value="png">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span>PNG</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TimetableDisplay;
