
import { Calendar, Download, Sparkles } from "lucide-react";

const features = [
  {
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: "Smart Scheduling",
    description: "Our algorithm creates conflict-free timetables that optimize faculty and classroom resources."
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: "Easy Customization",
    description: "Specify weekdays, time slots, courses, and faculties to create a timetable tailored to your needs."
  },
  {
    icon: <Download className="h-10 w-10 text-primary" />,
    title: "Export Options",
    description: "Download your generated timetable in Excel or PDF format for easy sharing and printing."
  }
];

const Features = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/50 dark:bg-secondary/20">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Use Our Timetable Generator?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-background rounded-lg p-6 shadow-sm border">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
