// utils/revenueByDate.js
export const buildDailyRevenue = (bookings) => {
  const start = new Date(Date.now() - 6 * 864e5);
  start.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });


  const map = {};
  bookings.forEach((b) => {
    const d = new Date(b.createdAt);
    const key = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const total = b.grandTotal ?? b.totalPrice ?? 0;
    map[key] = (map[key] || 0) + total;
  });

  const revenueArr = days.map((d) => {
    const k = d.toISOString().slice(0, 10);
    return +((map[k] || 0) / 1e6).toFixed(2); // triệu
  });

  const categories = days.map((d) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
  );

  return { revenueArr, categories };
};
