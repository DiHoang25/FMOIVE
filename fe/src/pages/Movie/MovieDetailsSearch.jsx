import React, { useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import spiderman from '../../assets/spider-man.jpg';
import { useNavigate } from 'react-router-dom';

const MovieDetails = () => {
    const showtimes = ['08:00', '12:00', '14:30', '15:00', '17:00', '19:30', '20:00', '21:00'];
    const [startDate, setStartDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const navigate = useNavigate();

    function getWeekDates(startDate) {
        const dates = [];
        const start = new Date(startDate);
        for (let i = 0; i < 6; i++) {
            const next = new Date(start);
            next.setDate(start.getDate() + i);
            dates.push(next);
        }
        return dates;
    }

    function formatDate(date) {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const day = days[date.getDay()];
        const dateNum = date.getDate().toString().padStart(2, '0');
        return `${dateNum} ${day}`;
    }
    return (
        <div className="bg-black text-white px-6 py-10 max-w-full mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">

                <div className="flex-shrink-0 w-full lg:w-1/3">
                    <img src={spiderman} alt="Spider-Man Poster" className="w-80 rounded-lg shadow-lg mx-auto" />

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
            <div className="mt-10 text-center bg-gray-900 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Choose Your Show</h2>

                {/* Week Date Selector */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <button
                        onClick={() => setStartDate(prev => {
                            const newStart = new Date(prev);
                            newStart.setDate(prev.getDate() - 6);
                            return newStart;
                        })}
                        className="p-2 rounded-full hover:bg-gray-700"
                    >
                        ❮
                    </button>

                    {getWeekDates(startDate).map((date, idx) => {
                        const label = formatDate(date);
                        const isSelected = selectedDate === label;
                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDate(label)}
                                className={`px-4 py-2 rounded text-sm font-medium ${isSelected ? 'bg-yellow-400 text-black' : 'bg-gray-800 hover:bg-red-600'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setStartDate(prev => {
                            const newStart = new Date(prev);
                            newStart.setDate(prev.getDate() + 6);
                            return newStart;
                        })}
                        className="p-2 rounded-full hover:bg-gray-700"
                    >
                        ❯
                    </button>
                </div>

                {/* Only show time buttons and book button if a date is selected */}
                {selectedDate && (
                    <>
                        <div className="flex flex-wrap justify-center gap-3">
                            {showtimes.map((time, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedTime(time)}
                                    className={`px-4 py-2 rounded text-sm font-medium ${selectedTime === time ? 'bg-yellow-400 text-black' : 'bg-gray-700 hover:bg-red-600'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (selectedDate && selectedTime) {
                                    navigate('/select-seats');
                                }
                            }}
                            className={`mt-4 px-5 py-2 rounded text-base w-fit transition
                            ${selectedDate && selectedTime
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
                            `}
                            disabled={!selectedDate || !selectedTime}
                        >
                            Book now
                        </button>
                    </>
                )}
            </div>


            <div className="mt-10 flex justify-center">
                <div className="relative w-[50%] h-[50vh]">
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