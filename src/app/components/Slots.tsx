import { Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Slot {
  id: number;
  time: string;
  date: string;
  provider: string;
  service: string;
  capacity: number;
  booked: number;
  status: 'available' | 'partial' | 'full' | 'blocked';
  demandLevel?: 'low' | 'high';
}

export function Slots() {
  const [slotsData, setSlotsData] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    fetch('/api/slots')
      .then(res => res.json())
      .then(data => setSlotsData(data))
      .catch(console.error);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-[#4F9CF9]/20 border-[#4F9CF9] text-[#4F9CF9]';
      case 'partial':
        return 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]';
      case 'full':
        return 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]';
      case 'blocked':
        return 'bg-[#94A3B8]/20 border-[#94A3B8] text-[#94A3B8]';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle size={14} />;
      case 'full':
        return <AlertCircle size={14} />;
      case 'blocked':
        return <AlertCircle size={14} />;
      default:
        return null;
    }
  };

  // Group slots by date
  const groupedSlots = slotsData.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl text-[#E6EDF3]">Slot Management</h3>
        <p className="text-sm text-[#94A3B8] mt-1">Auto-generated slots based on schedule rules and service configuration</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 bg-[#121821] border border-[#2A3441] rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#4F9CF9]/20 border-2 border-[#4F9CF9]"></div>
          <span className="text-xs text-[#94A3B8]">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#F59E0B]/20 border-2 border-[#F59E0B]"></div>
          <span className="text-xs text-[#94A3B8]">Partially Filled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#EF4444]/20 border-2 border-[#EF4444]"></div>
          <span className="text-xs text-[#94A3B8]">Full</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#94A3B8]/20 border-2 border-[#94A3B8]"></div>
          <span className="text-xs text-[#94A3B8]">Blocked</span>
        </div>
      </div>

      {/* Slots Grid */}
      {Object.keys(groupedSlots).map(date => (
        <div key={date}>
          <h4 className="text-md text-[#E6EDF3] mb-3 border-b border-[#2A3441] pb-2">{date}</h4>
          <div className="grid grid-cols-3 gap-4">
            {groupedSlots[date].map((slot) => (
              <div
                key={slot.id}
                className={`relative border-2 rounded-lg p-4 transition-all cursor-pointer ${getStatusColor(slot.status)} ${
                  selectedSlot?.id === slot.id ? 'ring-2 ring-[#4F9CF9] ring-offset-2 ring-offset-[#0B0F14]' : ''
                }`}
                onClick={() => setSelectedSlot(slot)}
              >
                {/* Demand Badge */}
                {slot.demandLevel && (
                  <div className={`absolute -top-2 -right-2 px-2 py-1 rounded text-xs ${
                    slot.demandLevel === 'low' ? 'bg-[#22C55E] text-[#E6EDF3]' : 'bg-[#EF4444] text-[#E6EDF3]'
                  }`}>
                    {slot.demandLevel === 'low' ? '✓ Best Slot' : '⚠ High Demand'}
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(slot.status)}
                      <span className="text-sm">{slot.time}</span>
                    </div>
                    <p className="text-xs opacity-80">{slot.provider}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs opacity-90">{slot.service}</p>

                  {/* Capacity Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="opacity-80">Capacity</span>
                      <span>{slot.booked}/{slot.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-current transition-all"
                        style={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Text */}
                  {slot.status === 'blocked' && (
                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-current/20">
                      <Info size={12} className="mt-0.5" />
                      <p className="text-xs opacity-80">Buffer time / Maintenance</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Info Panel */}
      <div className="bg-[#121821] border border-[#2A3441] rounded-lg p-5">
        <h4 className="text-sm text-[#E6EDF3] mb-3">System Rules</h4>
        <ul className="space-y-2 text-xs text-[#94A3B8]">
          <li className="flex items-start gap-2">
            <span className="text-[#4F9CF9] mt-0.5">•</span>
            <span>Slots are automatically generated based on working hours and service duration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4F9CF9] mt-0.5">•</span>
            <span>Buffer times prevent overlapping bookings and maintain schedule integrity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4F9CF9] mt-0.5">•</span>
            <span>Capacity limits are enforced - full slots cannot accept new bookings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4F9CF9] mt-0.5">•</span>
            <span>Blocked slots indicate maintenance periods or provider unavailability</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
