import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../services/api';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Maximize } from 'lucide-react';

export default function MeetingRoom() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const data = await api.getMeetingLink(Number(bookingId));
        setMeeting(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLink();
  }, [bookingId]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (error) return (
    <div style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center' }}>
      <div className="card">
        <VideoOff size={48} color="#ef4444" style={{ marginBottom: 20 }} />
        <h2 style={{ marginBottom: 12 }}>Cannot Join Meeting</h2>
        <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '12px 24px', 
        background: 'var(--surface1)', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-icon btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Online Meeting Room</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {meeting.meeting_id}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="badge badge-confirmed">LIVE</div>
        </div>
      </div>

      <div style={{ flex: 1, background: '#000', position: 'relative' }}>
        <iframe
          src={meeting.meeting_link}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>

      <div style={{ 
        padding: '16px', 
        background: 'var(--surface1)', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'center',
        gap: 16
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tip: Ensure your camera and microphone are allowed in your browser settings.
        </p>
      </div>
    </div>
  );
}
