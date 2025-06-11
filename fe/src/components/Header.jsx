import { Button } from "@/components/ui/button";
import { TicketIcon, Play } from "lucide-react";

export default function HeroSection() {
  const scrollToMovies = () => {
    const element = document.getElementById('movies');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.7)), url('https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800')`
        }}
      />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Experience Cinema <br />
          <span className="text-cinema-red">Like Never Before</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
          Immerse yourself in the latest blockbusters with state-of-the-art technology, luxury seating, and unparalleled comfort.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-cinema-red hover:bg-dark-red text-white px-8 py-4 text-lg"
            onClick={scrollToMovies}
          >
            <TicketIcon className="mr-2 h-5 w-5" />
            Book Tickets Now
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-cinema-red text-cinema-red hover:bg-cinema-red hover:text-white px-8 py-4 text-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Trailers
          </Button>
        </div>
      </div>
    </section>
  );
}
