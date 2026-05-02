import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { Services } from './components/Services';
import { Providers } from './components/Providers';
import { Schedule } from './components/Schedule';
import { Slots } from './components/Slots';
import { Bookings } from './components/Bookings';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Dashboard';
      case 'services':
        return 'Services';
      case 'providers':
        return 'Providers / Resources';
      case 'schedule':
        return 'Schedule';
      case 'slots':
        return 'Slots';
      case 'bookings':
        return 'Bookings';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'services':
        return <Services />;
      case 'providers':
        return <Providers />;
      case 'schedule':
        return <Schedule />;
      case 'slots':
        return <Slots />;
      case 'bookings':
        return <Bookings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="ml-64">
        <TopBar title={getPageTitle()} />
        <main className="pt-16 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}