
import { Link } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <Hero />
      
      <div className="flex justify-center -mt-12 md:-mt-16 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full animate-bounce"
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
      </div>
      
      <div id="features">
        <Features />
      </div>
      
      <HowItWorks />
      
      <section className="py-16 bg-primary/5">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Timetable?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start generating conflict-free college timetables in just a few clicks
          </p>
          <Link to="/generator">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
      
      <footer className="bg-secondary/30 dark:bg-secondary/10 py-8">
        <div className="container text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} TimetableGen • All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
