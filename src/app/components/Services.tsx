import { Edit, Trash2, Settings, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ServiceConfig } from './ServiceConfig';

export function Services() {
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServicesData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      fetchServices();
    } catch (e) {
      console.error(e);
    }
  };

  if (selectedService !== null) {
    return (
      <ServiceConfig
        service={servicesData.find(s => s.id === selectedService)}
        onBack={() => {
          setSelectedService(null);
          fetchServices();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl text-[#E6EDF3]">Service Management</h3>
          <p className="text-sm text-[#94A3B8] mt-1">Configure services and their scheduling rules</p>
        </div>
        <button 
          onClick={() => setSelectedService(-1)}
          className="bg-[#4F9CF9] text-[#E6EDF3] px-6 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          + Create Service
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {servicesData.map((service) => (
          <div key={service.id} className="bg-[#121821] border border-[#2A3441] rounded-lg p-6 hover:border-[#4F9CF9] transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg text-[#E6EDF3]">{service.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    service.status === 'active'
                      ? 'bg-[#22C55E]/20 text-[#22C55E]'
                      : 'bg-[#94A3B8]/20 text-[#94A3B8]'
                  }`}>
                    {service.status}
                  </span>
                </div>
                <p className="text-sm text-[#94A3B8]">{service.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#4F9CF9]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Duration</p>
                  <p className="text-sm text-[#E6EDF3]">{service.duration} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#22C55E]" />
                <div>
                  <p className="text-xs text-[#94A3B8]">Capacity</p>
                  <p className="text-sm text-[#E6EDF3]">{service.capacity}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Providers</p>
                <p className="text-sm text-[#E6EDF3]">{service.providers} assigned</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#2A3441]">
              <button
                onClick={() => setSelectedService(service.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1A2330] hover:bg-[#2A3441] text-[#E6EDF3] rounded-lg text-sm transition-colors"
              >
                <Settings size={16} />
                Configure
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 hover:bg-[#1A2330] text-[#94A3B8] rounded-lg text-sm transition-colors">
                <Edit size={16} />
              </button>
              <button 
                onClick={() => handleDelete(service.id)}
                className="flex items-center justify-center gap-2 px-4 py-2 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-lg text-sm transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
