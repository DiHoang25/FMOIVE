const movies = [
  {
    id: 1,
    title: "The Dark Knight",
    rating: 9.0,
    age: "PG-13",
    duration: "152 min",
    genres: ["Action", "Crime", "Drama"],
    price: "$12.50",
    desc: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...",
    image: "/images/dark-knight.jpg",
  },
  {
    id: 2,
    title: "Avengers: Endgame",
    rating: 8.4,
    age: "PG-13",
    duration: "181 min",
    genres: ["Action", "Adventure", "Sci-Fi"],
    price: "$12.50",
    desc: "The epic conclusion to the Infinity Saga brings all Marvel heroes together for the ultimate battle...",
    image: "/images/avengers.jpg",
  },
  {
    id: 3,
    title: "Final Destination",
    rating: 6.7,
    age: "R",
    duration: "98 min",
    genres: ["Horror", "Thriller"],
    price: "$12.50",
    desc: "Death comes for everyone in this supernatural horror thriller...",
    image: "/images/netflix.jpg",
  },
];

export default function NowShowing() {
  return (
    <section className="bg-[#0e1b2c] text-white py-16 px-4 md:px-10">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Now Showing</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-[#1c2a3a] rounded-lg overflow-hidden shadow-lg relative">
            <img src={movie.image} alt={movie.title} className="w-full h-64 object-cover" />
            {/* Rating Badge */}
            <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              ⭐ {movie.rating}
            </span>
            <div className="p-6 flex flex-col justify-between h-[270px]">
              <div>
                <h3 className="text-xl font-semibold">{movie.title}</h3>
                <p className="text-sm text-gray-300 mb-2">
                  {movie.age} • {movie.duration} • {movie.genres.join(", ")}
                </p>
                <p className="text-sm text-gray-400">{movie.desc}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-semibold">From {movie.price}</span>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
