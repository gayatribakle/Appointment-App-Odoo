import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Search, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ min_price: '', max_price: '', organizer_id: '' });

  const load = () => {
    setLoading(true);
    const params: any = { search };
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.organizer_id) params.organizer_id = filters.organizer_id;

    api.getActiveServices(params).then((d: any) => setServices(d)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // In a real app, you'd fetch a list of organizers here to populate the dropdown
    // For now, we'll just use the search
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find a Service</h1>
        <p className="page-subtitle">Discover and book professionals in your area.</p>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Service name or provider..."
              style={{ paddingLeft: 40 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
            <Search size={18} style={{ position: 'absolute', left: 12, top: 42, color: 'var(--text-muted)' }} />
          </div>
          <div style={{ width: 120 }}>
            <label className="form-label">Min Price (₹)</label>
            <input type="number" className="form-input" value={filters.min_price} onChange={e => setFilters({...filters, min_price: e.target.value})} />
          </div>
          <div style={{ width: 120 }}>
            <label className="form-label">Max Price (₹)</label>
            <input type="number" className="form-input" value={filters.max_price} onChange={e => setFilters({...filters, max_price: e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading}>Apply Filters</button>
        </div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div className="grid-3">
          {services.map((svc: any) => (
            <div key={svc.id} className="card hover-scale" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{svc.title}</h3>
                  <div className="badge badge-confirmed">₹{parseFloat(svc.advance_payment).toLocaleString('en-IN')}</div>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  {svc.description.length > 100 ? svc.description.slice(0, 100) + '...' : svc.description}
                </p>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} /> {svc.duration_mins}m
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IndianRupee size={14} /> Advance Required
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>by {svc.organizer_name}</span>
                <Link to={`/services/${svc.id}`} className="btn btn-primary btn-sm">
                  Book Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: 'var(--text-muted)' }}>No services found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
