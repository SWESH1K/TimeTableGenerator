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
      const tableColumn = ["Day/Time", ...timeSlots.map(slot => slot.id)];
      const tableRows: any[][] = [];
      
      weekdays.forEach(day => {
        const row: any[] = [day];
        timeSlots.forEach(slot => {
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
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 20 } },
        headStyles: { fillColor: [66, 66, 66] },
        didDrawPage: function(data) {
          // Add page number
          doc.setFontSize(8);
          doc.text(
            `Page ${doc.getNumberOfPages()}`, 
            data.settings.margin.left, 
            doc.internal.pageSize.height - 5
          );
        }
      });
      
      // Get table end position to know where to start the next table
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Add title for professor mapping table
      doc.setFontSize(14);
      doc.text("Professors Names", 14, finalY);
      
      // Get unique course-professor pairs from this section's timetable
      const courseProfessorMap = new Map<string, Set<string>>();
      
      // Extract all course-professor pairs from the timetable
      Object.values(timetable).forEach(daySlots => {
        Object.values(daySlots).forEach(events => {
          events.forEach(event => {
            if (!courseProfessorMap.has(event.Professor)) {
              courseProfessorMap.set(event.Professor, new Set());
            }
            courseProfessorMap.get(event.Professor)?.add(event.Course);
          });
        });
      });
      
      // Prepare data for professor mapping table
      const profTableHeader = ["Professor", "Courses"];
      const profTableRows = Array.from(courseProfessorMap.entries()).map(([professor, courses]) => 
        [professor, Array.from(courses).join(", ")]
      );
      
      // Add professor mapping table
      autoTable.default(doc, {
        head: [profTableHeader],
        body: profTableRows,
        startY: finalY + 5,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Add footer with generation time
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated: ${new Date().toLocaleString()}`, 
        14, 
        doc.internal.pageSize.height - 5
      );
      
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
