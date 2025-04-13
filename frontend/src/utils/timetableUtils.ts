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

// Function to export timetable to Excel
export function exportToExcel(timetable: Timetable, weekdays: string[], timeSlots: TimeSlot[]): void {
  // Dynamically import xlsx to avoid bundling issues
  import('xlsx').then(XLSX => {
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare the data for Excel
    const excelData: any[][] = [];
    
    // Create header row
    const headerRow = ["Day/Time"];
    timeSlots.forEach(slot => {
      headerRow.push(slot.id);
    });
    excelData.push(headerRow);
    
    // Add data rows
    weekdays.forEach(day => {
      const row: any[] = [day];
      timeSlots.forEach(slot => {
        const events = timetable[day]?.[slot.id] || [];
        if (events.length > 0) {
          const event = events[0]; // Take the first event
          row.push(`${event.Course} (${event.Type})\n${event.Professor}`);
        } else {
          row.push("-");
        }
      });
      excelData.push(row);
    });
    
    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    
    // Save the file
    XLSX.writeFile(wb, "timetable.xlsx");
  }).catch(error => {
    console.error("Failed to export to Excel:", error);
    alert("Failed to export to Excel. Please try again.");
  });
}

// Function to export timetable to PNG
export function exportToPNG(timetableElement: HTMLElement): void {
  // Dynamically import html2canvas
  import('html2canvas').then(html2canvas => {
    const h2c = html2canvas.default;
    h2c(timetableElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true
    }).then(canvas => {
      // Create download link
      const link = document.createElement('a');
      link.download = 'timetable.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(error => {
      console.error('Failed to export to PNG:', error);
      alert('Failed to export to PNG. Please try again.');
    });
  }).catch(error => {
    console.error('Failed to load html2canvas:', error);
    alert('Failed to load image export library. Please try again.');
  });
}

// Function to export timetable to PDF
export function exportToPDF(timetable: Timetable, weekdays: string[], timeSlots: TimeSlot[]): void {
  // Dynamically import jspdf and jspdf-autotable
  Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]).then(([jsPDF, autoTable]) => {
    const doc = new jsPDF.default();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Generated Timetable", 14, 22);
    doc.setFontSize(12);
    
    // Prepare the data for PDF
    const tableColumn = ["Day/Time", ...timeSlots.map(slot => slot.id)];
    const tableRows: any[][] = [];
    
    weekdays.forEach(day => {
      const row: any[] = [day];
      timeSlots.forEach(slot => {
        const events = timetable[day]?.[slot.id] || [];
        if (events.length > 0) {
          const event = events[0]; // Take the first event
          row.push(`${event.Course} (${event.Type})`); // Removed professor name
        } else {
          row.push("-");
        }
      });
      tableRows.push(row);
    });

    // Create the table
    autoTable.default(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 30 } },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Save the PDF
    doc.save("timetable.pdf");
  }).catch(error => {
    console.error("Failed to export to PDF:", error);
    alert("Failed to export to PDF. Please try again.");
  });
}
