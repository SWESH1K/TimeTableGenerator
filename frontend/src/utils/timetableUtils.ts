// Types
export interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Faculty {
  id: string;
  name: string;
}

export interface TimetableEvent {
  Course: string;
  Day: string;
  "Time Slot": string;
  Section: string;
  Type: string;
  Professor: string;
}

export interface Timetable {
  [day: string]: {
    [timeSlotId: string]: TimetableEvent[];
  };
}

export interface TimetableFormData {
  sections: string[];
  courses: { [section: string]: string[] };
  professors: { [course: string]: string };
  ltps: { [course: string]: { L: number; T: number; P: number; S: number } };
  days: string[];
  time_slots: string[];
  max_continuous_hours: number;
  weekdays: string[];
  timeSlots: TimeSlot[];
}

// Helper function to generate a simple ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Function to export timetable to PDF - robust implementation
export function exportToPDF(timetable: Timetable, weekdays: string[], timeSlots: TimeSlot[], section: string): void {
  // Sort time slots to ensure T1 to T8 order if they aren't already sorted
  const sortedTimeSlots = [...timeSlots].sort((a, b) => {
    // Extract numbers from time slot ids (e.g., "T1" -> 1)
    const aNum = parseInt(a.id.replace(/\D/g, ''));
    const bNum = parseInt(b.id.replace(/\D/g, ''));
    return aNum - bNum;
  });
  
  // Dynamically import jspdf and jspdf-autotable
  Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]).then(([jsPDF, autoTable]) => {
    try {
      const doc = new jsPDF.default({
        orientation: timeSlots.length > 5 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title with section name
      doc.setFontSize(18);
      doc.text(`Timetable for Section ${section}`, 14, 15);
      doc.setFontSize(12);
      
      // Prepare the data for timetable
      const tableColumn = ["Day/Time", ...sortedTimeSlots.map(slot => slot.id)];
      const tableRows: any[][] = [];
      
      weekdays.forEach(day => {
        const row: any[] = [day];
        sortedTimeSlots.forEach(slot => {
          const events = timetable[day]?.[slot.id] || [];
          if (events.length > 0) {
            const event = events[0];
            // Remove professor name from the timetable cell
            row.push(`${event.Course}\n(${event.Type})`);
          } else {
            row.push("-");
          }
        });
        tableRows.push(row);
      });

      // Create the timetable
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { 
          fontSize: 9,
          cellPadding: 2,
          halign: 'center', // Center text horizontally
          valign: 'middle'  // Center text vertically
        },
        columnStyles: { 
          0: { cellWidth: 20, halign: 'left' } // Keep first column (days) left-aligned
        },
        headStyles: { 
          fillColor: [66, 66, 66],
          halign: 'center'
        },
      });
      
      // Get table end position to know where to start the next table
      const finalY = (doc as any).lastAutoTable.finalY + 10;

      // Add title for professor mapping table
      doc.setFontSize(14);
      doc.text("Professors Names", 14, finalY);

      // Get unique course-professor pairs organized by course
      const courseToProf = new Map<string, Set<string>>();
      
      // Extract all course-professor pairs from the timetable
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
      
      // Prepare data for professor mapping table with swapped columns
      const profTableHeader = ["Courses", "Professor"];
      const profTableRows = Array.from(courseToProf.entries()).map(([course, professors]) => 
        [course, Array.from(professors).join(", ")]
      );
      
      // Add professor mapping table
      autoTable.default(doc, {
        head: [profTableHeader],
        body: profTableRows,
        startY: finalY + 5,
        styles: { 
          fontSize: 10, 
          cellPadding: 3,
          // halign: 'center',
          // valign: 'middle'
        },
        // columnStyles: {
        //   0: { halign: 'center' }, // Center course names
        //   1: { halign: 'center' }  // Center professor names
        // },
        headStyles: { 
          fillColor: [66, 66, 66],
          // halign: 'center'
        }
      });
      
      // Add branded footer
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // First part of the text in regular styling
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const regularText = "generated by ";
      const regularTextWidth = doc.getStringUnitWidth(regularText) * 8 / doc.internal.scaleFactor;
      
      // Position for the regular text (right aligned, with space for the branded text)
      const brandedText = "TimeTableGen";
      const brandedTextWidth = doc.getStringUnitWidth(brandedText) * 10 / doc.internal.scaleFactor; // Larger font
      const totalWidth = regularTextWidth + brandedTextWidth;
      const startX = pageWidth - totalWidth - 10; // 10mm margin from right
      
      // Add the regular text part
      doc.text(regularText, startX, doc.internal.pageSize.height - 10);
      
      // Add the branded text part with special styling
      doc.setTextColor(128, 90, 213); // Purple color
      doc.setFontSize(10);  // Larger font size
      doc.text(brandedText, startX + regularTextWidth, doc.internal.pageSize.height - 10);
      
      // Save the PDF with section name
      doc.save(`timetable_section_${section}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("There was an error generating your PDF. Please try again.");
    }
  }).catch(error => {
    console.error("Failed to load PDF libraries:", error);
    alert("Failed to load required libraries for PDF generation. Please check your connection and try again.");
  });
}
