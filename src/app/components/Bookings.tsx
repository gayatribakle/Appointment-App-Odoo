import { Filter, X, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RescheduleModal } from './RescheduleModal';

interface Booking {
  id: number;
  customer: string;
  service: string;
  slotTime: string;
  provider: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  date: string;
}

export function Bookings() {
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookingsData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookingsData.filter(booking => {
    const statusMatch = selectedStatus === 'all' || booking.status === selectedStatus;
    const serviceMatch = selectedService === 'all' || booking.service === selectedService;
    return statusMatch && serviceMatch;
  });

  const handleCancel = async (id: number) => {
    try {
      await fetch(`/api/bookings/${id}/cancel`, { method: 'PUT' });
      fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl text-[#E6EDF3]">Booking Management</h3>
            <p className="text-sm text-[#94A3B8] mt-1">View and manage all appointments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-[#121821] border border-[#2A3441] rounded-lg p-4">
          <Filter size={18} className="text-[#94A3B8]" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-[#1A2330] border border-[#2A3441] rounded text-sm text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-1.5 bg-[#1A2330] border border-[#2A3441] rounded text-sm text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
            >
              <option value="all">All Services</option>
              <option value="Consultation">Consultation</option>
              <option value="Group Session">Group Session</option>
              <option value="Workshop">Workshop</option>
              <option value="Team Meeting">Team Meeting</option>
            </select>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Calendar size={14} />
            <span>Showing {filteredBookings.length} bookings</span>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-[#121821] border border-[#2A3441] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A3441] bg-[#1A2330]">
                <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">CUSTOMER</th>
                <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">SERVICE</th>
                <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">DATE</th>
                <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">SLOT TIME</th>
                <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">PROVIDER</th>
                <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">STATUS</th>
                <th className="text-right px-6 py-4 text-xs text-[#94A3B8]">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr
                  key={booking.id}
                  className={`border-b border-[#2A3441] hover:bg-[#1A2330] transition-colors ${
                    index === filteredBookings.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#E6EDF3]">{booking.customer}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#E6EDF3]">{booking.service}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#94A3B8]">{booking.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#E6EDF3]">{booking.slotTime}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#94A3B8]">{booking.provider}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs ${
                      booking.status === 'confirmed'
                        ? 'bg-[#22C55E]/20 text-[#22C55E]'
                        : booking.status === 'pending'
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        : 'bg-[#EF4444]/20 text-[#EF4444]'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => setRescheduleBooking(booking)}
                            className="px-3 py-1.5 bg-[#4F9CF9] text-[#E6EDF3] rounded text-xs hover:opacity-90 transition-opacity"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="px-3 py-1.5 bg-[#EF4444]/20 text-[#EF4444] rounded text-xs hover:bg-[#EF4444]/30 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => {
            setRescheduleBooking(null);
            fetchBookings();
          }}
        />
      )}
    </>
  );
}
