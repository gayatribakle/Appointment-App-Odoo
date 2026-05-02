import { useState } from "react";
import { Search, Filter, Edit2, UserPlus, Star } from "lucide-react";

import { useData } from "../../context/DataContext";

export function ProvidersManagement() {
  const { providers, toggleProviderStatus } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === "All" || provider.specialty === filterSpecialty;
    const matchesStatus = filterStatus === "All" || provider.status === filterStatus;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Providers Management</h2>
          <p className="text-gray-500">Manage service providers and their availability.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
          <p className="text-2xl text-green-600">{providers.filter(p => p.status === "Available").length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Busy</p>
          <p className="text-2xl text-yellow-600">{providers.filter(p => p.status === "Busy").length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Off-duty</p>
          <p className="text-2xl text-gray-600">{providers.filter(p => p.status === "Off-duty").length}</p>
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
                <th className="text-left text-xs text-gray-500 px-6 py-4">Rating</th>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-900">{provider.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{provider.appointments}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        provider.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : provider.status === "Busy"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{provider.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleProviderStatus(provider.id)}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Toggle Status
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>Showing {filteredProviders.length} of {providers.length} providers</p>
      </div>
    </div>
  );
}
