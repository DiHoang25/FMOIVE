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
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-red-600 mb-10 text-center">Promotions</h1>
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 min-h-[350px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{promo.title}</h3>
                  <p className="text-red-500 font-medium mb-2">
                    {formatDate(promo.start_date)} – {formatDate(promo.end_date)}
                  </p>
                  <p className="text-gray-300 text-base">{promo.short_description}</p>
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
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 opacity-100 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mt-7">
              <img
                src={selectedPromo.image_url}
                alt={selectedPromo.title}
                className="w-100 h-80 object-cover"
              />
              <button
                className="absolute top-4 right-1 bg-black bg-opacity-70 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors"
                onClick={closePromoDetails}
              >
                ✕
              </button>
            </div>
            

            

            <div className="p-6 text-gray-800">
              <h2 className="text-3xl font-bold text-red-600 mb-4">{selectedPromo.title}</h2>
              <h3 className="text-xl font-semibold text-red-500 mb-4">
  {formatDate(selectedPromo.start_date)} – {formatDate(selectedPromo.end_date)}
</h3>
              

              <h3 className="text-xl font-semibold mt-6 mb-3">Thể lệ:</h3>
              <p className="mb-4">{selectedPromo.full_details.rules}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
                {selectedPromo.full_details.combos.map((combo, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-medium text-red-600 mb-2">
                      {combo.title} - <span className="text-gray-700">{combo.price}k</span>
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {combo.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {selectedPromo.full_details.notes && (
                <p className="text-gray-600 italic text-sm mb-4">
                  *{selectedPromo.full_details.notes}
                </p>
              )}

              <h3 className="text-xl font-semibold mt-6 mb-3">Điều kiện:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {selectedPromo.full_details.conditions.map((cond, index) => (
                  <li key={index}>{cond}</li>
                ))}
              </ul>

              <div className="mt-8 text-center">
                <button
                  className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition duration-300 font-semibold"
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
