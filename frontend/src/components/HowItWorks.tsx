
import { CheckCircle2 } from "lucide-react";

const steps = [
  "Enter the weekdays you want to include in your timetable",
  "Specify the time slots for each day",
  "Add the number of courses and faculties",
  "Click 'Generate Timetable' and let our algorithm handle the rest",
  "Download your timetable in Excel or PDF format"
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-lg">
                    <span className="font-semibold mr-2">Step {index + 1}:</span>
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
