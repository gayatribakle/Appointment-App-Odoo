import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ServiceConfigProps {
  service?: any;
  onBack: () => void;
}

export function ServiceConfig({ service, onBack }: ServiceConfigProps) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    core: true,
    rules: true,
  });

  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    duration: service?.duration || 60,
    capacity: service?.capacity || 1,
    type: service?.type || 'One-to-One',
    buffer_before: service?.buffer_before || 15,
    buffer_after: service?.buffer_after || 15,
    advance_booking_limit: service?.advance_booking_limit || 30,
    cancellation_deadline: service?.cancellation_deadline || 24,
    status: service?.status || 'active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['duration', 'capacity', 'buffer_before', 'buffer_after', 'advance_booking_limit', 'cancellation_deadline'].includes(name) ? Number(value) : value }));
  };

  const handleSave = async () => {
    try {
      if (service?.id) {
        await fetch(`/api/services/${service.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      onBack();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#E6EDF3] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back to Services</span>
        </button>
      </div>

      <div className="bg-[#121821] border border-[#2A3441] rounded-lg p-6">
        <h3 className="text-xl text-[#E6EDF3] mb-6">Service Configuration</h3>

        {/* Basic Info Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h4 className="text-base text-[#E6EDF3]">Basic Information</h4>
            {expandedSections.basic ? <ChevronUp className="text-[#94A3B8]" size={20} /> : <ChevronDown className="text-[#94A3B8]" size={20} />}
          </button>

          {expandedSections.basic && (
            <div className="space-y-4 pl-4 border-l-2 border-[#4F9CF9]">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                  placeholder="Describe the service"
                />
              </div>
            </div>
          )}
        </div>

        {/* Core Settings Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('core')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h4 className="text-base text-[#E6EDF3]">Core Settings</h4>
            {expandedSections.core ? <ChevronUp className="text-[#94A3B8]" size={20} /> : <ChevronDown className="text-[#94A3B8]" size={20} />}
          </button>

          {expandedSections.core && (
            <div className="space-y-4 pl-4 border-l-2 border-[#4F9CF9]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">Duration (minutes)</label>
                  <select name="duration" value={formData.duration} onChange={handleChange} className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]">
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={90}>90</option>
                    <option value={120}>120</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                    placeholder="Max participants"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1">Maximum number of participants per slot</p>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Appointment Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]">
                  <option value="One-to-One">One-to-One</option>
                  <option value="Group">Group</option>
                  <option value="Resource-based">Resource-based</option>
                </select>
                <p className="text-xs text-[#94A3B8] mt-1">Determines how slots are generated and managed</p>
              </div>
            </div>
          )}
        </div>

        {/* Rules Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('rules')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h4 className="text-base text-[#E6EDF3]">Scheduling Rules</h4>
            {expandedSections.rules ? <ChevronUp className="text-[#94A3B8]" size={20} /> : <ChevronDown className="text-[#94A3B8]" size={20} />}
          </button>

          {expandedSections.rules && (
            <div className="space-y-4 pl-4 border-l-2 border-[#4F9CF9]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">Buffer Before (minutes)</label>
                  <input
                    type="number"
                    name="buffer_before"
                    value={formData.buffer_before}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1">Time blocked before each appointment</p>
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">Buffer After (minutes)</label>
                  <input
                    type="number"
                    name="buffer_after"
                    value={formData.buffer_after}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1">Time blocked after each appointment</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">Advance Booking Window (days)</label>
                  <input
                    type="number"
                    name="advance_booking_limit"
                    value={formData.advance_booking_limit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1">How far ahead customers can book</p>
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">Cancellation Deadline (hours)</label>
                  <input
                    type="number"
                    name="cancellation_deadline"
                    value={formData.cancellation_deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1">Minimum notice required for cancellations</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-[#2A3441]">
          <button 
            onClick={handleSave}
            className="flex-1 bg-[#4F9CF9] text-[#E6EDF3] px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Configuration
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#1A2330] text-[#E6EDF3] rounded-lg hover:bg-[#2A3441] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
