
import Navbar from "@/components/Navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Help = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Help & FAQ
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does the timetable generator work?</AccordionTrigger>
              <AccordionContent>
                Our timetable generator uses a mathematical programming algorithm to create conflict-free timetables. 
                It takes into account your specified weekdays, time slots, courses, and faculties to generate an 
                optimal schedule that avoids overlaps and maximizes resource utilization.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I edit the generated timetable?</AccordionTrigger>
              <AccordionContent>
                Currently, direct editing of the generated timetable is not supported in the web interface. 
                However, you can download the timetable in Excel format and make modifications using spreadsheet 
                software. Future updates will include the ability to manually adjust the generated timetable.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>What formats can I download the timetable in?</AccordionTrigger>
              <AccordionContent>
                You can download the generated timetable in either Excel (CSV) or PDF format. 
                Excel is recommended if you need to make further edits, while PDF is better for 
                printing or sharing the final timetable.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Is there a limit to how many courses or faculties I can add?</AccordionTrigger>
              <AccordionContent>
                There's no strict limit on the number of courses or faculties you can add. 
                However, for optimal performance and meaningful results, we recommend keeping 
                the number reasonable (typically under 50 courses and faculties). Very large datasets 
                may impact the generation time and quality of the timetable.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Can I save my timetable configurations for future use?</AccordionTrigger>
              <AccordionContent>
                The ability to save configurations for future use is planned for a future update. 
                Currently, you'll need to re-enter the information if you want to generate a new timetable. 
                You can, however, keep the downloaded files for your records.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger>Does the system account for faculty availability?</AccordionTrigger>
              <AccordionContent>
                In the current version, the system assumes all faculties are available during all selected time slots. 
                A future enhancement will allow you to specify availability constraints for individual faculties to 
                create even more accurate timetables.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Need more help?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions that aren't answered here, please contact us.
            </p>
            <div className="inline-block border rounded-md p-4">
              <p className="font-medium">Support Email</p>
              <p className="text-primary">lk5999950@gmail.com</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-secondary/30 dark:bg-secondary/10 py-6 mt-12">
        <div className="container text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} TimetableGen • All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Help;
