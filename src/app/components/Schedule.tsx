import { Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export function Schedule() {
  const [workingDays, setWorkingDays] = useState([true, true, true, true, true, false, false]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotInterval, setSlotInterval] = useState(60);

  useEffect(() => {
    fetch('/api/schedule')
      .then(res => res.json())
      .then(data => {
        setWorkingDays(data.working_days);
        setStartTime(data.start_time);
        setEndTime(data.end_time);
        setSlotInterval(data.slot_interval);
      })
      .catch(console.error);
  }, []);

  const toggleDay = (index: number) => {
    const newDays = [...workingDays];
    newDays[index] = !newDays[index];
    setWorkingDays(newDays);
  };

  const applyChanges = async () => {
    try {
      await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          working_days: workingDays,
          start_time: startTime,
          end_time: endTime,
          slot_interval: slotInterval
        })
      });
      alert('Schedule updated successfully. Slots have been regenerated.');
    } catch (e) {
      console.error(e);
    }
  };

  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl text-[#E6EDF3]">Schedule Configuration</h3>
        <p className="text-sm text-[#94A3B8] mt-1">Define working hours - system auto-generates slots based on rules</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          {/* Working Days */}
          <div className="bg-[#121821] border border-[#2A3441] rounded-lg p-5">
            <h4 className="text-sm text-[#E6EDF3] mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-[#4F9CF9]" />
              Working Days
            </h4>
            <div className="space-y-2">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => toggleDay(index)}
                  className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                    workingDays[index]
                      ? 'bg-[#4F9CF9] text-[#E6EDF3]'
                      : 'bg-[#1A2330] text-[#94A3B8] hover:bg-[#2A3441]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="bg-[#121821] border border-[#2A3441] rounded-lg p-5">
            <h4 className="text-sm text-[#E6EDF3] mb-4 flex items-center gap-2">
              <Clock size={16} className="text-[#4F9CF9]" />
              Time Range
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A2330] border border-[#2A3441] rounded text-sm text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1.5">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A2330] border border-[#2A3441] rounded text-sm text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                />
              </div>
            </div>
          </div>

          {/* Slot Interval */}
          <div className="bg-[#121821] border border-[#2A3441] rounded-lg p-5">
            <h4 className="text-sm text-[#E6EDF3] mb-4">Slot Interval</h4>
            <select
              value={slotInterval}
              onChange={(e) => setSlotInterval(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#1A2330] border border-[#2A3441] rounded text-sm text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
            <p className="text-xs text-[#94A3B8] mt-2">Slots auto-generated based on this interval</p>
          </div>

          <button onClick={applyChanges} className="w-full bg-[#4F9CF9] text-[#E6EDF3] px-4 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity">
            Apply Changes
          </button>
        </div>

        {/* Main Panel - Weekly Calendar Grid */}
        <div className="col-span-3 bg-[#121821] border border-[#2A3441] rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm text-[#E6EDF3]">Weekly Availability Grid</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#4F9CF9]"></div>
                <span className="text-[#94A3B8]">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#2A3441]"></div>
                <span className="text-[#94A3B8]">Not Working</span>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid grid-cols-8 gap-1 mb-1">
                <div className="h-10"></div>
                {DAYS.map((day, idx) => (
                  <div
                    key={day}
                    className={`h-10 flex items-center justify-center text-xs ${
                      workingDays[idx] ? 'text-[#E6EDF3]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                  <div className="h-12 flex items-center justify-end pr-2 text-xs text-[#94A3B8]">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {DAYS.map((day, idx) => (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-12 rounded ${
                        workingDays[idx] && hour >= startHour && hour < endHour
                          ? 'bg-[#4F9CF9]/20 border border-[#4F9CF9]/40 cursor-pointer hover:bg-[#4F9CF9]/30'
                          : 'bg-[#1A2330] border border-[#2A3441]'
                      }`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#4F9CF9]/10 border border-[#4F9CF9]/30 rounded-lg">
            <p className="text-xs text-[#4F9CF9]">
              ⚡ Slots are automatically generated based on working hours and interval settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
