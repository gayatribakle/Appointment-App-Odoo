import { Edit, Trash2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProviderConfig } from './ProviderConfig';

export function Providers() {
  const [providersData, setProvidersData] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      setProvidersData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await fetch(`/api/providers/${id}`, { method: 'DELETE' });
      fetchProviders();
    } catch (e) {
      console.error(e);
      alert('Failed to delete provider.');
    }
  };

  if (selectedProvider !== null) {
    return (
      <ProviderConfig
        provider={selectedProvider === -1 ? undefined : providersData.find(p => p.id === selectedProvider)}
        onBack={() => {
          setSelectedProvider(null);
          fetchProviders();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl text-[#E6EDF3]">Provider & Resource Management</h3>
          <p className="text-sm text-[#94A3B8] mt-1">Manage team members and resources assigned to services</p>
        </div>
        <button 
          onClick={() => setSelectedProvider(-1)}
          className="bg-[#4F9CF9] text-[#E6EDF3] px-6 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add New
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#121821] border border-[#2A3441] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A3441] bg-[#1A2330]">
              <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">NAME</th>
              <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">TYPE</th>
              <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">ASSIGNED SERVICES</th>
              <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">HOURS/WEEK</th>
              <th className="text-left px-6 py-4 text-xs text-[#94A3B8]">STATUS</th>
              <th className="text-right px-6 py-4 text-xs text-[#94A3B8]">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {providersData.map((provider, index) => (
              <tr
                key={provider.id}
                className={`border-b border-[#2A3441] hover:bg-[#1A2330] transition-colors ${
                  index === providersData.length - 1 ? 'border-0' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <p className="text-sm text-[#E6EDF3]">{provider.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs ${
                    provider.type === 'Provider'
                      ? 'bg-[#4F9CF9]/20 text-[#4F9CF9]'
                      : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                  }`}>
                    {provider.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {provider.services?.map((service: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#1A2330] border border-[#2A3441] rounded text-xs text-[#94A3B8]">
                        {service}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-[#E6EDF3]">{provider.hours_per_week}h</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs ${
                    provider.status === 'available'
                      ? 'bg-[#22C55E]/20 text-[#22C55E]'
                      : 'bg-[#EF4444]/20 text-[#EF4444]'
                  }`}>
                    {provider.status === 'available' ? (
                      <CheckCircle size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {provider.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setSelectedProvider(provider.id)}
                      className="p-2 hover:bg-[#1A2330] rounded text-[#94A3B8] hover:text-[#E6EDF3] transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(provider.id)}
                      className="p-2 hover:bg-[#EF4444]/20 rounded text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
