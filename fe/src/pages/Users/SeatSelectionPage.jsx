// SeatSelectionPage.jsx
import React, { useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import SelectSeatGrid from '../../components/SelectSeatGrid';

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSeats, setMovieDetails } from '../../redux/bookingSlice'; // Đảm bảo import setMovieDetails

// Helper function to format minutes into "Xh Ym"
const formatMinutesToHoursMinutes = (minutes) => {
    if (typeof minutes !== 'number' || minutes < 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
};

function SeatSelectionPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Lấy movieDetails từ Redux store
    const movieDetails = useSelector((state) => state.booking.movieDetails);

    // Kiểm tra nếu movieDetails không có, chuyển hướng người dùng về trang chi tiết phim
    // hoặc hiển thị thông báo lỗi
    useEffect(() => {
        if (!movieDetails || !movieDetails.fullShowtime) {
            // Nếu không có thông tin phim hoặc thời gian chiếu đầy đủ,
            // có thể do người dùng truy cập trực tiếp URL hoặc làm mới trang
            // Điều hướng về trang chi tiết phim hoặc trang chủ
            console.warn("Movie details or showtime missing in Redux. Redirecting.");
            navigate('/'); // Hoặc navigate(`/movies/${movieId}`) nếu bạn có ID phim
        }
    }, [movieDetails, navigate]);

    // Sử dụng movieDetails từ Redux, nếu chưa có thì dùng fallback
    const movie = movieDetails || {
        name: 'Movie Title N/A',
        image_url: 'https://placehold.co/120x180/000000/FFFFFF?text=No+Poster',
        version: 'N/A',
        running_time: 'N/A',
        selectedTime: 'N/A', // Sử dụng selectedTime thay vì time
        selectedDate: 'N/A', // Sử dụng selectedDate thay vì time
        cinema_room: 'N/A',
        rating: 'N/A',
        genres: [],
    };

    // Định dạng lại ngày và giờ chiếu từ Redux
    const formattedShowtime = movie.selectedDate && movie.selectedTime
        ? `${new Date(movie.selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${movie.selectedTime}`
        : 'N/A';
    // Hoặc nếu bạn muốn hiển thị định dạng "DD DAY" như trong MovieDetails
    const formattedDateForDisplay = movie.selectedDate
        ? (() => {
            const date = new Date(movie.selectedDate);
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            return `${date.getDate().toString().padStart(2, '0')} ${days[date.getDay()]}`;
        })()
        : 'N/A';
    const displayTime = `${formattedDateForDisplay}, ${movie.selectedTime}`;

    const handleSeatSelectionContinue = (selectedSeats, totalSeatPrice) => {
        dispatch(setSelectedSeats({
            seats: selectedSeats,
            totalPrice: totalSeatPrice,
        }));

        navigate('/combo-selection');
    };

    const handleBack = () => {
        navigate(-1);
    };

    const formattedRunningTime = formatMinutesToHoursMinutes(movie.running_time);

    // Không render nếu movieDetails chưa có để tránh lỗi
    if (!movieDetails || !movieDetails.fullShowtime) {
        return null; // Hoặc một spinner/loading component
    }

    return (
        <div className="bg-black min-h-screen text-white px-6 py-10">
            <div className="bg-[#1a1a1a] max-w-xl mx-auto p-6 rounded">
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
                    >
                        ← Back
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-center mb-8">SELECT YOUR SEATS</h1>

                <div className="flex gap-4 mb-6 items-center">
                    <img
                        src={movie.image_url}
                        alt={movie.name}
                        className="w-[120px] h-[180px] object-cover rounded"
                    />
                    <div className="flex-1 space-y-1">
                        <h2 className="text-2xl font-bold text-white">{movie.name}</h2>
                        <p className="text-gray-300 text-sm">
                            {movie.version} • {formattedRunningTime} • {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'N/A'}
                        </p>
                        <p className="text-gray-300 text-sm">
                            {displayTime} • {movie.cinema_room}
                        </p>
                    </div>
                </div>

                <SelectSeatGrid onContinue={handleSeatSelectionContinue} />
            </div>
        </div>
    );
}

export default SeatSelectionPage;