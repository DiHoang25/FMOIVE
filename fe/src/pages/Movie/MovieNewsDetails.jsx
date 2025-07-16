import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MovieNewsDetails = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/movie-news/news/${slug}`);
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      }
    };

    fetchNews();
  }, [slug]);

  if (!news) {
    return (
      <div className="bg-black text-white px-4 py-20">
        <h1 className="text-center text-2xl">Loading news...</h1>
      </div>
    );
  }

  return (
    <div className="bg-black text-white px-4 sm:px-6 py-10 space-y-8 sm:space-y-10">
      {/* Tiêu đề */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-2">{news.title}</h1>
      <hr className="mx-auto border-red-500 w-[80%] sm:w-[400px] mb-4" />

      {/* Hình và nội dung */}
      <div className="space-y-4">
        <img
          src={news.image_url}
          alt={news.title}
          className="w-full max-w-[95%] sm:max-w-xl mx-auto rounded-lg shadow-lg"
        />
        <div className="max-w-full sm:max-w-3xl mx-auto px-1 sm:px-0 text-base sm:text-lg">
          <p className="italic text-xs sm:text-sm text-gray-400 mb-2 text-center sm:text-left">
            By {news.author || 'Unknown'} • {new Date(news.date).toLocaleDateString('vi-VN')}
          </p>
          <div className="space-y-3 sm:space-y-4 leading-relaxed text-sm sm:text-lg">
            {news.content?.split('\n').map((para, idx) => (
              <p key={idx}>{para.trim()}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieNewsDetails;
