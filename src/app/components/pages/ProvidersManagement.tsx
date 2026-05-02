import { useState } from "react";
import { Search, Filter, Edit2, UserPlus, Trash2, Loader2 } from "lucide-react";

import { useData } from "../../context/DataContext";

export function ProvidersManagement() {
  const { providers, toggleProviderStatus, addProvider, deleteProvider, loading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("All Specialties");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: "", email: "", specialty: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProvider = async () => {
    if (!newProvider.name || !newProvider.email || !newProvider.specialty) return;
    setIsSubmitting(true);
    try {
      await addProvider(newProvider);
      setShowAddModal(false);
      setNewProvider({ name: "", email: "", specialty: "" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      try {
        await deleteProvider(id);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const listedSpecialties = ["General Medicine", "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Neurology"];
    const matchesSpecialty = filterSpecialty === "All Specialties" ||
                             (filterSpecialty === "Others" && !listedSpecialties.includes(provider.specialty)) ||
                             provider.specialty === filterSpecialty;
                             
    const statusMap: any = { "Available": "AVAILABLE", "Busy": "BUSY", "Off-duty": "OFF_DUTY" };
    const matchesStatus = filterStatus === "All Status" || provider.status === statusMap[filterStatus];
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Providers Management</h2>
          <p className="text-gray-500">Manage service providers and their availability.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <UserPlus className="w-5 h-5" />
          Add Provider
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total Providers</p>
          <p className="text-2xl text-gray-900">{providers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Available</p>
          <p className="text-2xl text-green-600">{providers.filter(p => p.status === "AVAILABLE").length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Busy</p>
          <p className="text-2xl text-yellow-600">{providers.filter(p => p.status === "BUSY").length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Off-duty</p>
          <p className="text-2xl text-gray-600">{providers.filter(p => p.status === "OFF_DUTY").length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Specialties</option>
                <option>General Medicine</option>
                <option>Cardiology</option>
                <option>Pediatrics</option>
                <option>Dermatology</option>
                <option>Orthopedics</option>
                <option>Neurology</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All Status</option>
              <option>Available</option>
              <option>Busy</option>
              <option>Off-duty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs text-gray-500 px-6 py-4">Provider</th>
                <th className="text-left text-xs text-gray-500 px-6 py-4">Specialty</th>
                <th className="text-left text-xs text-gray-500 px-6 py-4">Appointments</th>
                <th className="text-left text-xs text-gray-500 px-6 py-4">Status</th>
                <th className="text-left text-xs text-gray-500 px-6 py-4">Joined</th>
                <th className="text-left text-xs text-gray-500 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((provider) => (
                <tr key={provider.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{provider.name}</p>
                        <p className="text-xs text-gray-500">{provider.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                      {provider.specialty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{provider.appointments}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        provider.status === "AVAILABLE"
                          ? "bg-green-100 text-green-700"
                          : provider.status === "BUSY"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleProviderStatus(provider.id, provider.status)}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Rotate Status
                      </button>
                      <button 
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProviders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No providers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>Showing {filteredProviders.length} of {providers.length} providers</p>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Add New Provider</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={newProvider.name} onChange={e => setNewProvider({...newProvider, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Dr. John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={newProvider.email} onChange={e => setNewProvider({...newProvider, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="doctor@clinic.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <input type="text" value={newProvider.specialty} onChange={e => setNewProvider({...newProvider, specialty: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Cardiology" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={handleAddProvider} 
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Adding..." : "Add Provider"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

