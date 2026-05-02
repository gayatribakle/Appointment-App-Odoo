import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface ProviderConfigProps {
  provider?: any;
  onBack: () => void;
}

export function ProviderConfig({ provider, onBack }: ProviderConfigProps) {
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    type: provider?.type || 'Provider',
    hours_per_week: provider?.hours_per_week || 40,
    status: provider?.status || 'available'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'hours_per_week' ? Number(value) : value 
    }));
  };

  const handleSave = async () => {
    try {
      if (provider?.id) {
        await fetch(`/api/providers/${provider.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      onBack();
    } catch (e) {
      console.error(e);
      alert('Failed to save provider.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#E6EDF3] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back to Providers</span>
        </button>
      </div>

      <div className="bg-[#121821] border border-[#2A3441] rounded-lg p-6">
        <h3 className="text-xl text-[#E6EDF3] mb-6">Provider Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
              placeholder="Enter provider/resource name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
              >
                <option value="Provider">Provider (Person)</option>
                <option value="Resource">Resource (Room/Equipment)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Hours per Week</label>
              <input
                type="number"
                name="hours_per_week"
                value={formData.hours_per_week}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              className="w-full px-4 py-2 bg-[#1A2330] border border-[#2A3441] rounded-lg text-[#E6EDF3] focus:outline-none focus:border-[#4F9CF9]"
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance/Unavailable</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t border-[#2A3441]">
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
