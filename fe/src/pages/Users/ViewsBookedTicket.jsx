import React, { useState } from 'react';
import { Modal } from 'antd';
import UserDashboardLayout from '../../components/UserDashboardlayout';
import PaginationControls from '../../components/PaginationHomepage';
import avengers from '../../assets/avengers.jpg';

const ticketData = [
    {
        id: 'BK012345',
        movie: 'Avengers: Endgame',
        date: 'Dec 25, 2026',
        time: '7:30 PM',
        status: 'CONFIRMED',
        seats: 'A12, A13',
        screen: 'Screen 1',
        bookingDate: 'Dec 20, 2024',
        ticketPrice: '$20',
        imdb: '8.5/10',
        duration: '2h 50m'
    },
    {
        id: 'BK012346',
        movie: 'Avengers: Endgame',
        date: 'Dec 25, 2024',
        time: '9:00 PM',
        status: 'PENDING',
        seats: 'A14, A15',
        screen: 'Screen 2',
        bookingDate: 'Dec 20, 2024',
        ticketPrice: '$22',
        imdb: '8.5/10',
        duration: '2h 50m'
    },
    {
        id: 'BK012347',
        movie: 'Avengers: Endgame',
        date: 'Dec 24, 2027',
        time: '6:30 PM',
        status: 'CONFIRMED',
        seats: 'A16, A17',
        screen: 'Screen 3',
        bookingDate: 'Dec 19, 2024',
        ticketPrice: '$21',
        imdb: '8.5/10',
        duration: '2h 50m'
    },
    {
        id: 'BK012349',
        movie: 'Avengers: Endgame',
        date: 'Dec 25, 2024',
        time: '9:00 PM',
        status: 'PENDING',
        seats: 'A14, A15',
        screen: 'Screen 2',
        bookingDate: 'Dec 20, 2024',
        ticketPrice: '$22',
        imdb: '8.5/10',
        duration: '2h 50m'
    },
    {
        id: 'BK012347',
        movie: 'Avengers: Endgame',
        date: 'Dec 24, 2024',
        time: '6:30 PM',
        status: 'CONFIRMED',
        seats: 'A16, A17',
        screen: 'Screen 3',
        bookingDate: 'Dec 19, 2024',
        ticketPrice: '$21',
        imdb: '8.5/10',
        duration: '2h 50m'
    },
    {
        id: 'BK012348',
        movie: 'Avengers: Endgame',
        date: 'Dec 26, 2024',
        time: '8:00 PM',
        status: 'CONFIRMED',
        seats: 'A18, A19',
        screen: 'Screen 4',
        bookingDate: 'Dec 22, 2024',
        ticketPrice: '$23',
        imdb: '8.5/10',
        duration: '2h 50m'
    }
];

const ITEMS_PER_PAGE = 4;

const generateCaptcha = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };
  
  const ViewsBookedTicket = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [viewModal, setViewModal] = useState(null);
    const [cancelModal, setCancelModal] = useState(null);
    const [success, setSuccess] = useState(false);
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [inputCaptcha, setInputCaptcha] = useState('');
    const [captchaError, setCaptchaError] = useState('');
  
    const maxPage = Math.ceil(ticketData.length / ITEMS_PER_PAGE) - 1;
    const currentTickets = ticketData.slice(
      pageIndex * ITEMS_PER_PAGE,
      (pageIndex + 1) * ITEMS_PER_PAGE
    );
  
    return (
      <UserDashboardLayout>
        <div className="bg-black text-white p-6 rounded-md">
          <h2 className="text-2xl font-bold text-center mb-6">Yours Booked Ticket</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ticketData.length === 0 ? (
              <p className="text-center col-span-full">You haven't booked any ticket yet</p>
            ) : (
              currentTickets.map((ticket, idx) => (
                <div key={idx} className="bg-white text-black rounded shadow-md overflow-hidden">
                  <div className="bg-red-600 text-white px-4 py-2 font-bold">
                    {ticket.movie}<br /><span className="text-sm font-normal">Booking ID: {ticket.id}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p><strong>SHOW DATE:</strong> {ticket.date}</p>
                    <p><strong>SHOW TIME:</strong> {ticket.time}</p>
                    <p><strong>SEATS:</strong> {ticket.seats}</p>
                    <p><strong>THEATER:</strong> {ticket.screen}</p>
                    <p><strong>STATUS:</strong> <span className={`px-2 py-1 rounded text-xs ${ticket.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ticket.status}</span></p>
                    <div className="flex gap-2">
                      <button onClick={() => setViewModal(ticket)} className="bg-black text-white text-sm px-3 py-1 rounded">View Details</button>
                      <button onClick={() => {
                        setCancelModal(ticket);
                        setCaptcha(generateCaptcha());
                        setInputCaptcha('');
                        setCaptchaError('');
                      }} className="bg-red-600 text-white text-sm px-3 py-1 rounded disabled:opacity-40" disabled={new Date(ticket.date) < new Date()}>Cancel Ticket</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
  
          {ticketData.length > ITEMS_PER_PAGE && (
            <PaginationControls
              currentPage={pageIndex}
              totalPages={Math.ceil(ticketData.length / ITEMS_PER_PAGE)}
              onPageChange={setPageIndex}
            />
          )}
        </div>
  
        <Modal
          open={!!viewModal}
          onCancel={() => setViewModal(null)}
          footer={null}
          centered
          width={700}
        >
          {viewModal && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <img src={avengers} alt="Poster" className="w-48 h-auto rounded" />
                <div className="flex-1 space-y-1">
                  <h2 className="text-lg font-bold">Details</h2>
                  <p><strong>SHOW DATE:</strong> {viewModal.date}</p>
                  <p><strong>SEATS:</strong> {viewModal.seats}</p>
                  <p><strong>THEATER:</strong> {viewModal.screen}</p>
                  <p><strong>BOOKING DATE:</strong> {viewModal.bookingDate}</p>
                  <p><strong>SHOW TIME:</strong> {viewModal.time}</p>
                  <p><strong>PURCHASED TICKET:</strong> {viewModal.ticketPrice}</p>
                  <p><strong>IMDB:</strong> {viewModal.imdb}</p>
                  <p><strong>DURATION:</strong> {viewModal.duration}</p>
                </div>
              </div>
              <button onClick={() => setViewModal(null)} className="mt-4 bg-red-600 text-white px-5 py-2 rounded w-full">Close</button>
            </div>
          )}
        </Modal>
  
        <Modal
          open={!!cancelModal && !success}
          onCancel={() => setCancelModal(null)}
          footer={null}
          centered
          width={400}
        >
          <div className="text-center space-y-4 p-6">
            <h3 className="text-red-600 font-bold text-md">ARE YOU REALLY WANT TO CANCEL TICKET?</h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-left">Verification Code:</p>
              <div className="flex items-center justify-between">
                <div className="bg-gray-100 px-4 py-2 font-mono rounded text-black tracking-widest select-none">{captcha}</div>
                <button
                  onClick={() => {
                    setCaptcha(generateCaptcha());
                    setInputCaptcha('');
                    setCaptchaError('');
                  }}
                  className="text-red-500 hover:underline text-sm"
                >
                  Reload
                </button>
              </div>
              <input
                type="text"
                value={inputCaptcha}
                onChange={(e) => setInputCaptcha(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-black"
                placeholder="Enter the code above"
              />
              {captchaError && <p className="text-red-500 text-sm">{captchaError}</p>}
            </div>
  
            <button
              onClick={() => {
                if (inputCaptcha !== captcha) {
                  setCaptchaError('Incorrect verification code.');
                  return;
                }
                setSuccess(true);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded"
            >
              Submit
            </button>
          </div>
        </Modal>
  
        <Modal
          open={success}
          onCancel={() => {
            setSuccess(false);
            setCancelModal(null);
          }}
          footer={null}
          centered
          width={350}
        >
          <div className="text-center p-6">
            <div className="text-green-500 text-5xl mb-4">✔️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Success</h3>
            <p className="text-sm text-gray-600">80% of the ticket price will be refunded to your bank card</p>
            <button
              onClick={() => {
                setSuccess(false);
                setCancelModal(null);
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded w-full"
            >
              Close
            </button>
          </div>
        </Modal>
      </UserDashboardLayout>
    );
  };
  
  export default ViewsBookedTicket;
  