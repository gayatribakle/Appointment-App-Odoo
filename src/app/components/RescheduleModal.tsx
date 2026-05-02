import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RescheduleModalProps {
  booking: any;
  onClose: () => void;
}

export function RescheduleModal({ booking, onClose }: RescheduleModalProps) {
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/slots')
      .then(res => res.json())
      .then(data => {
        // Only show slots for the same service
        const filtered = data.filter((s: any) => s.service === booking.service);
        setAvailableSlots(filtered);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [booking.service]);

  const handleConfirm = async () => {
    if (!selectedSlotId) return;
    try {
      await fetch(`/api/bookings/${booking.id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_slot_id: selectedSlotId })
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to reschedule booking.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121821] border border-[#2A3441] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A3441]">
          <div>
            <h3 className="text-lg text-[#E6EDF3]">Reschedule Booking</h3>
            <p className="text-sm text-[#94A3B8] mt-1">Select a new time slot</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A2330] rounded-lg transition-colors"
          >
            <X className="text-[#94A3B8]" size={20} />
          </button>
        </div>

        {/* Current Booking Details */}
        <div className="p-6 border-b border-[#2A3441] bg-[#1A2330]">
          <h4 className="text-sm text-[#94A3B8] mb-3">Current Booking</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#94A3B8]">Customer</p>
              <p className="text-sm text-[#E6EDF3]">{booking.customer}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Service</p>
              <p className="text-sm text-[#E6EDF3]">{booking.service}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Current Time</p>
              <p className="text-sm text-[#E6EDF3]">{booking.date} • {booking.slotTime}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Provider</p>
              <p className="text-sm text-[#E6EDF3]">{booking.provider}</p>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="text-sm text-[#E6EDF3] mb-4">Available Slots</h4>
          {loading ? (
            <div className="text-[#94A3B8] text-sm">Loading slots...</div>
          ) : availableSlots.length === 0 ? (
             <div className="text-[#94A3B8] text-sm">No alternative slots available for this service.</div>
          ) : (
            <div className="space-y-2">
              {availableSlots.map((slot) => {
                const isAvailable = slot.status !== 'full' && slot.status !== 'blocked';
                const isSelected = selectedSlotId === slot.id;
                
                return (
                  <button
                    key={slot.id}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#4F9CF9] bg-[#4F9CF9]/10'
                        : isAvailable
                        ? 'border-[#2A3441] bg-[#1A2330] hover:border-[#4F9CF9]/40 cursor-pointer'
                        : 'border-[#2A3441] bg-[#1A2330]/50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          {isAvailable ? (
                            <CheckCircle size={16} className="text-[#22C55E]" />
                          ) : (
                            <AlertCircle size={16} className="text-[#EF4444]" />
                          )}
                          <span className="text-sm text-[#E6EDF3]">{slot.date} • {slot.time}</span>
                          {isAvailable && slot.demandLevel === 'high' && (
                            <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] rounded text-xs">
                              ⚠ High demand
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#94A3B8] ml-7">{slot.provider}</p>
                      </div>

                      {!isAvailable && (
                        <div className="flex items-center gap-1.5 text-xs text-[#EF4444]">
                          <Info size={14} />
                          <span>{slot.status === 'full' ? 'Fully Booked' : 'Blocked'}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2A3441] bg-[#1A2330]">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleConfirm}
              disabled={!selectedSlotId}
              className={`flex-1 px-6 py-3 rounded-lg transition-opacity ${selectedSlotId ? 'bg-[#4F9CF9] text-[#E6EDF3] hover:opacity-90' : 'bg-[#4F9CF9]/50 text-[#E6EDF3]/50 cursor-not-allowed'}`}
            >
              Confirm Reschedule
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#121821] border border-[#2A3441] text-[#E6EDF3] rounded-lg hover:bg-[#2A3441] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
