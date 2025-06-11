import React from 'react';
import ReactPlayer from 'react-player/youtube';
import spiderman from '../../assets/spider-man.jpg';

const MovieDetails = () => {
    return (
        <div className="bg-black text-white px-6 py-10 max-w-full mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">

                <div className="flex-shrink-0 w-full lg:w-1/3">
                    <img src={spiderman} alt="Spider-Man Poster" className="w-80 rounded-lg shadow-lg mx-auto" />
                    <button className=" mt-4 bg-red-600 text-white px-3 py-2 rounded text-base hover:bg-red-600 transition w-full">
                        Book now
                    </button>
                </div>


                <div className="flex-1 space-y-3">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">
                        The Amazing Spider-Man
                    </h1>
                    <hr className="border-red-500 w-45 mb-4" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><span className="font-semibold text-xl">Release date:</span> June 29, 2012</p>
                            <p><span className="font-semibold text-xl">Genre:</span> Action, Sci-Fi</p>
                            <p><span className="font-semibold text-xl">Duration Time:</span> 136 min</p>
                            <p><span className="font-semibold text-xl">Director:</span> Marc Webb</p>
                            <p><span className="font-semibold text-xl">Actor:</span> Tom Holland — Peter Parker / Spider-Man, 
                                Zendaya — MJ (Michelle Jones), 
                                Benedict Cumberbatch — Doctor Strange, 
                                Jacob Batalon — Ned Leedsm, 
                                Marisa Tomei — Aunt May, 
                                Willem Dafoe — Green Goblin / Norman Osborn,
                                Alfred Molina — Doctor Octopus / Otto Octavius,
                                Jamie Foxx — Electro / Max Dillon, 
                                William DeVoe — Sandman / Flint Marko, 
                                Thomas Haden Church — Sandman / Flint Marko,
                                Raimi Tobey — Peter Parker / Spider-Man,
                                Andrew Garfield — Peter Parker / Spider-Man.</p>
                        </div>
                        <div>
                            <p><span className="font-semibold text-xl">Classification:</span> 16+</p>
                            <p><span className="font-semibold texl-xl">Distributed by:</span> Sony Pictures Releasing</p>
                        </div>
                    </div>


                    <div className="mt-6 text-xl">
                        <p className="font-semibold mb-1">Summary:</p>
                        <p className="text-gray-300">
                        Spider-Man: No Way Home follows Peter Parker after his 
                        secret identity is revealed. To restore normalcy, he seeks Doctor Strange’s help 
                        to erase everyone’s memory of his identity. However, the spell goes wrong, causing 
                        villains from other universes—like Green Goblin, Doctor Octopus, Electro, and Sandman—to 
                        cross into their world. Peter teams up with different versions of Spider-Man from other universes, 
                        played by Tobey Maguire and Andrew Garfield, to stop the chaos. The film explores themes of responsibility, 
                        sacrifice, and heroism. In the end, Peter accepts his new reality, setting the stage for future adventures.
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