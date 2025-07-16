import React, { useEffect, useState } from 'react';

function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/promotions');
        const data = await res.json();
        setPromotions(data);
      } catch (err) {
        console.error('Lỗi khi tải promotions:', err);
      }
    };

    fetchPromotions();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const openPromoDetails = (promo) => {
    setSelectedPromo(promo);
    document.body.style.overflow = 'hidden';
  };

  const closePromoDetails = () => {
    setSelectedPromo(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 sm:py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-6 sm:mb-8 md:mb-10 text-center">Promotions</h1>
        

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {promotions.map((promo) => (
            <div
              key={promo._id}
              className="bg-black rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 h-full flex flex-col"
              onClick={() => openPromoDetails(promo)}
            >
              <div className="relative overflow-hidden flex-grow">
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 min-h-[250px] sm:min-h-[300px] md:min-h-[350px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{promo.title}</h3>
                  <p className="text-red-500 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    {formatDate(promo.start_date)} – {formatDate(promo.end_date)}
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base">{promo.short_description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPromo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 transition-opacity duration-300"
          onClick={closePromoDetails}
        >
          <div
            className="bg-white rounded-lg w-full max-w-xs sm:max-w-md md:max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 opacity-100 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mt-4 sm:mt-7 relative">
              <img
                src={selectedPromo.image_url}
                alt={selectedPromo.title}
                className="w-full h-48 sm:h-64 md:h-80 object-contain"
              />
              <button
                className="absolute top-2 right-2 bg-black bg-opacity-70 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors"
                onClick={closePromoDetails}
              >
                ✕
              </button>
            </div>
            

            

            <div className="p-4 sm:p-6 text-gray-800">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-2 sm:mb-4">{selectedPromo.title}</h2>
              <h3 className="text-lg sm:text-xl font-semibold text-red-500 mb-2 sm:mb-4">
  {formatDate(selectedPromo.start_date)} – {formatDate(selectedPromo.end_date)}
</h3>
              

              <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">Thể lệ:</h3>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base">{selectedPromo.full_details.rules}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 my-3 sm:my-5">
                {selectedPromo.full_details.combos.map((combo, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-sm">
                    <h4 className="text-base sm:text-lg font-medium text-red-600 mb-1 sm:mb-2">
                      {combo.title} - <span className="text-gray-700">{combo.price}k</span>
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                      {combo.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {selectedPromo.full_details.notes && (
                <p className="text-gray-600 italic text-xs sm:text-sm mb-3 sm:mb-4">
                  *{selectedPromo.full_details.notes}
                </p>
              )}

              <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">Điều kiện:</h3>
              <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                {selectedPromo.full_details.conditions.map((cond, index) => (
                  <li key={index}>{cond}</li>
                ))}
              </ul>

              <div className="mt-6 sm:mt-8 text-center">
                <button
                  className="bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-red-700 transition duration-300 font-semibold text-sm sm:text-base"
                  onClick={closePromoDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromotionsPage;

