import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import promo1Image from '../../assets/promo-kids.jpg';
import promo2Image from '../../assets/promo-summer.jpg';
import promo3Image from '../../assets/promo-shopping.jpg';

const promotions = [
  {
    id: 1,
    title: "Khởi Ngoan Xinh Yêu - Quá Cute Dễ Kids",
    image: promo1Image,
    period: "01.06.2025 – 30.08.2025",
    shortDesc: "Ưu đãi combo bắp nước dành cho trẻ em",
    fullDetails: `
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Thời gian: 01.06.2025 – 30.06.2025</h3>
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Thể lệ:</h3>
      <p class="text-gray-700 mb-4">Khách hàng mua vé được áp dụng giá ưu đãi khi mua Combo bắp nước thiếu nhi.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
        <div class="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h4 class="text-lg font-medium text-red-600 mb-2">Combo Con Ngoan:</h4>
          <ul class="list-disc pl-5 space-y-2 text-gray-700">
            <li>1 Bắp + 2 Juicy Milk + 01 sp Orion tặng kèm = 109k</li>
            <li>1 Bắp + 2 Juicy Milk + ly Rồng/ ly Wish + 01 sp Orion tặng kèm = 269k</li>
          </ul>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h4 class="text-lg font-medium text-red-600 mb-2">Combo Trò Giỏi:</h4>
          <ul class="list-disc pl-5 space-y-2 text-gray-700">
            <li>2 Bắp + 3 Juicy Milk + 2 sp Orion tặng kèm = 149k</li>
            <li>2 Bắp + 3 Juicy Milk + ly Rồng/ ly Wish + 02 sp Orion tặng kèm = 299k</li>
          </ul>
        </div>
      </div>
      
      <p class="text-gray-600 italic text-sm mb-4">*Sản phẩm Orion được áp dụng ngẫu nhiên giữa: Hộp ngũ cốc Miz/ Jungle Boy</p>
      
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Điều kiện:</h3>
      <ul class="list-disc pl-5 space-y-2 text-gray-700">
        <li>Áp dụng tại các hệ thống rạp</li>
        <li>Áp dụng cho tất cả khách hàng có giao dịch trực tiếp tại rạp hoặc online</li>
        <li>Không áp dụng đồng thời các chương trình khuyến mãi khác</li>
      </ul>
    `
  },
  {
    id: 2,
    title: "Xem Phim Real Chất - Bật Hè Rất Chill",
    image: promo2Image,
    period: "30.06.2025 – 15.09.2025",
    shortDesc: "Nhận E-voucher MIỄN PHÍ refill bắp nước khi mua combo",
    fullDetails: `
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Thời gian: 30.05.2025 – 15.06.2025</h3>
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Thể lệ:</h3>
      <p class="text-gray-700 mb-4">Khách hàng có giao dịch vé + combo sẽ nhận ngay Deal Ưu Đãi.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
        <div class="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h4 class="text-lg font-medium text-red-600 mb-2">Combo Bật Mood Hè:</h4>
          <p class="text-gray-700">2 bắp + 2 nước: 135k (khu vực HCM)/ 125k (khu vực tỉnh)</p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h4 class="text-lg font-medium text-red-600 mb-2">Combo Chill Rạp Êm:</h4>
          <p class="text-gray-700">3 bắp + 3 nước: 155k (khu vực HCM)/ 145k (khu vực tỉnh)</p>
        </div>
      </div>
      
      <h4 class="text-lg font-medium text-gray-800 mt-5 mb-2">Deal Ưu Đãi:</h4>
      <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-5">
        <li>E-voucher MIỄN PHÍ 01 lần châm thêm bắp nước</li>
        <li>E-voucher giảm giá các thương hiệu: Domino's Pizza/ Gà Rán Popeyes</li>
      </ul>
      
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Điều kiện:</h3>
      <ul class="list-disc pl-5 space-y-2 text-gray-700">
        <li>Áp dụng khi mua vé các phim: Doraemon; Lilo & Stitch; Mission Impossible; Sinners</li>
        <li>Áp dụng cho thành viên, từ thứ sáu đến chủ nhật hàng tuần</li>
        <li>E-voucher châm thêm bắp nước có giá trị đến 30.06.2025</li>
      </ul>
    `
  },
  {
    id: 3,
    title: "Vui Mua Sắm - Galaxy Mời Bắp Ngọt",
    image: promo3Image,
    period: "26.06.2025 – 26.08.2025",
    shortDesc: "Mua sắm tại AEON MALL Huế - Nhận bắp MIỄN PHÍ tại Galaxy Cinema",
    fullDetails: `
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Thời gian: 26.05.2025 – 26.06.2025</h3>
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Thể lệ:</h3>
      <p class="text-gray-700 mb-4">Khách hàng có hóa đơn mua sắm tại TTTM AEON MALL Huế (từ 200.000đ) đến Galaxy Aeon Mall Huế sẽ được:</p>
      
      <div class="bg-gray-50 rounded-lg p-4 my-5">
        <ul class="list-disc pl-5 space-y-2 text-gray-700">
          <li>Nhận 01 phần bắp ngọt MIỄN PHÍ khi mua tối thiểu 2 vé xem phim</li>
          <li>01 e-Voucher MIỄN PHÍ refill bắp nước (dành cho thành viên)</li>
          <li>01 e-Voucher MIỄN PHÍ 1 tháng tại khu vui chơi Cine de Play (dành cho thành viên)</li>
          <li>Liên hoàn e-Voucher từ các thương hiệu khác</li>
        </ul>
      </div>
      
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Điều kiện:</h3>
      <ul class="list-disc pl-5 space-y-2 text-gray-700">
        <li>Ưu đãi áp dụng cho giao dịch phát sinh trong cùng ngày mua sắm</li>
        <li>Hóa đơn hợp lệ từ 200.000đ/giao dịch, không cộng gộp nhiều hóa đơn</li>
        <li>Mỗi hóa đơn chỉ đổi được 01 phần bắp ngọt</li>
      </ul>
    `
  }
];

function PromotionsPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);

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
              key={promo.id}
              className="bg-black rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 h-full flex flex-col"
              onClick={() => openPromoDetails(promo)}
            >
              <div className="relative overflow-hidden flex-grow">
                <img 
                  src={promo.image} 
                  alt={promo.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 min-h-[350px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{promo.title}</h3>
                  <p className="text-red-500 font-medium mb-2">{promo.period}</p>
                  <p className="text-gray-300 text-base">{promo.shortDesc}</p>
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
            <div className="relative">
              <img 
                src={selectedPromo.image} 
                alt={selectedPromo.title} 
                className="w-full h-64 object-cover"
              />
              <button 
                className="absolute top-4 right-4 bg-black bg-opacity-70 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors"
                onClick={closePromoDetails}
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-3xl font-bold text-red-600 mb-4">{selectedPromo.title}</h2>
              <div 
                className="text-gray-800"
                dangerouslySetInnerHTML={{ __html: selectedPromo.fullDetails }}
              />
              
              <div className="mt-8 text-center">
                <button 
                  className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition duration-300 font-semibold"
                  onClick={closePromoDetails}
                >
                  X
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