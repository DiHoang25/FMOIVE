import React from 'react';
import ReactPlayer from 'react-player/youtube';

const MovieDetails = () => {
    return (
        <div className="bg-black text-white px-6 py-10 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Poster */}
                <div className="flex-shrink-0 w-full lg:w-1/3">
                    <img src="https://cdn.moveek.com/storage/media/cache/cover_large/images/articles/2023/05/25/spider-man-1-movie-poster-8db1d3d6b29e3a062dbfc6eb6a4d3ef1.webp" alt="Spider-Man Poster" className="w-full rounded-lg shadow-lg" />
                    <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded text-base hover:bg-red-700 transition w-full">
                        Book now
                    </button>
                </div>


                <div className="flex-1 space-y-3">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">
                        The Amazing Spider-Man
                    </h1>
                    <hr className="border-red-500 w-32 mb-4" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><span className="font-semibold">Release date:</span> June 29, 2012</p>
                            <p><span className="font-semibold">Genre:</span> Action, Sci-Fi</p>
                            <p><span className="font-semibold">Duration Time:</span> 136 min</p>
                            <p><span className="font-semibold">Director:</span> Marc Webb</p>
                            <p><span className="font-semibold">Actor:</span> Andrew Garfield, Emma Stone, Rhys Ifan</p>
                        </div>
                        <div>
                            <p><span className="font-semibold">Classification:</span> 16+</p>
                            <p><span className="font-semibold">Distributed by:</span> Sony Pictures Releasing</p>
                        </div>
                    </div>


                    <div className="mt-6 text-sm">
                        <p className="font-semibold mb-1">Summary:</p>
                        <p className="text-gray-300">
                            After Peter Parker is bitten by a genetically altered spider, he gains newfound,
                            spider-like powers and ventures out to save the city from the machinations of a mysterious
                            reptilian foe.
                        </p>
                    </div>
                </div>
            </div>


            <div className="mt-10">
                <div className="relative pb-[56.25%] h-0">
                    <ReactPlayer
                        url="https://www.youtube.com/watch?v=JfVOs4VSpmA"
                        controls
                        width="100%"
                        height="100%"
                        className="absolute top-0 left-0"
                    />
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;