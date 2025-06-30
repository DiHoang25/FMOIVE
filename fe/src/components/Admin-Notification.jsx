import React, { useState, useEffect } from 'react';
import { FloatButton, notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const App = () => {
    const [api, contextHolder] = notification.useNotification();
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [newMovies, setNewMovies] = useState([]);
    const [deletedMovies, setDeletedMovies] = useState([]);

    const getCalculatedStatus = (start, end) => {
        const today = dayjs();
        if (today.isBefore(start)) return 'coming_soon';
        if (today.isAfter(end)) return 'ended';
        return 'now_showing';
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const [moviesRes, deletedRes] = await Promise.all([
                    fetch('http://localhost:5000/api/movies'),
                    fetch('http://localhost:5000/api/movies/deleted/all')
                ]);
                
                if (!moviesRes.ok) throw new Error('Failed to fetch movies');
                if (!deletedRes.ok) throw new Error('Failed to fetch deleted movies');
                
                const movies = await moviesRes.json();
                const deletedMovies = await deletedRes.json();
                
                // Filter movies with upcoming status
                const upcoming = movies.filter(movie => {
                    const status = getCalculatedStatus(dayjs(movie.start_date), dayjs(movie.end_date));
                    return status === 'ended';
                });
                
                setUpcomingMovies(upcoming);
                setDeletedMovies(deletedMovies.filter(movie => 
                    getCalculatedStatus(dayjs(movie.start_date), dayjs(movie.end_date)) === 'ended'
                ));
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
        fetchMovies();
        
        // Set interval to check for updates every minute
        const interval = setInterval(fetchMovies, 60000);
        return () => clearInterval(interval);
    }, []);

    const openNotification = () => {
        if (upcomingMovies.length === 0 && newMovies.length === 0) {
            api.open({
                message: 'Notification',
                description: 'There have been no changes recently.',
                duration: 6,
                showProgress: true,
                pauseOnHover: true,
            });
            return;
        }
    
        const descriptionContent = (
            <div>
                {deletedMovies.length > 0 && (
                    <>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {deletedMovies.length} Movie(s) Recently Deleted:
                        </div>
                        {deletedMovies.map(movie => (
                            <div key={movie._id}>
                                - <strong>{movie.name}</strong>: Ended on {dayjs(movie.end_date).format('DD/MM/YYYY')}
                            </div>
                        ))}
                        <br />
                    </>
                )}
                {upcomingMovies.length > 0 && (
                    <>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {upcomingMovies.length} Movie(s) Have Ended:
                        </div>
                        {upcomingMovies.map(movie => (
                            <div key={movie._id}>
                                - <strong>{movie.name}</strong>: Ended on {dayjs(movie.end_date).format('DD/MM/YYYY')}
                            </div>
                        ))}
                        <br />
                    </>
                )}
                {newMovies.length > 0 && (
                    <>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {newMovies.length} New Movie(s) Added:
                        </div>
                        {newMovies.map(movie => (
                            <div key={movie._id}>
                                - <strong>{movie.name}</strong>: Added at {dayjs(movie.createdAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                        ))}
                    </>
                )}
            </div>
        );
    
        api.open({
            message: 'Movie Notifications',
            description: descriptionContent,
            duration: 12,
            showProgress: true,
            pauseOnHover: true,
        });
    };
    
    useEffect(() => {
        const checkNewMovies = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/movies');
                const movies = await res.json();  
                const recentlyAdded = movies.filter(movie =>
                    new Date(movie.createdAt) > Date.now() - 24 * 60 * 60 * 1000
                );   
                if (recentlyAdded.length > 0) {
                    setNewMovies(recentlyAdded);
                }                
            } catch (err) {
                console.error('Error checking new movies:', err);
            }
        };
    
        checkNewMovies(); // Call once immediately on mount
        const interval = setInterval(checkNewMovies, 60000); // Then every minute
        return () => clearInterval(interval);
    }, []);
    

    return (
        <>
            {contextHolder}
            <FloatButton
                icon={<BellOutlined />}
                badge={{ count: upcomingMovies.length + newMovies.length + deletedMovies.length }}

                tooltip={<div>Display notifications about changes</div>}
                onClick={openNotification}
                style={{
                    backgroundColor: '#1677ff',
                    color: '#fff',
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                }}
            />
        </>
    );
};

export default App;