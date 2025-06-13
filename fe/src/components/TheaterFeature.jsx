import { Armchair, Volume2, Eye, UtensilsCrossed } from "lucide-react";

export default function TheaterFeatures() {
  const features = [
    {
      icon: Armchair,
      title: "Luxury Recliner Seats",
      description: "Fully reclining leather seats with personal tables and cup holders for ultimate comfort"
    },
    {
      icon: Volume2,
      title: "Dolby Atmos Sound",
      description: "Immersive audio technology that moves sound around you in three-dimensional space"
    },
    {
      icon: Eye,
      title: "4K Laser Projection",
      description: "Crystal-clear visuals with enhanced brightness and vivid colors for every scene"
    },
    {
      icon: UtensilsCrossed,
      title: "Gourmet Concessions",
      description: "Premium snacks and meals delivered directly to your seat during the movie"
    }
  ];

  return (
    <section id="theaters" className="py-20 bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-off-white">Premium Theater Experience</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience movies like never before with our state-of-the-art theaters and premium amenities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Premium Theater Image */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Premium Theater Interior" 
              className="rounded-xl shadow-2xl w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
          </div>

          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-cinema-red rounded-full p-3 flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-off-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cinema Lobby Image */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600" 
            alt="Modern Cinema Lobby" 
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-start p-12">
            <div className="max-w-lg">
              <h3 className="text-3xl font-bold text-white mb-4">Welcome to CineMax</h3>
              <p className="text-gray-200 text-lg mb-6">
                Step into our modern lobby and experience the future of cinema entertainment
              </p>
              <button 
                onClick={() => {
                  const element = document.getElementById('movies');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-cinema-red hover:bg-dark-red text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Book Your Experience
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
