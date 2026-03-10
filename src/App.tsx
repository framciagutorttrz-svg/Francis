import { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  LayoutDashboard, 
  Megaphone, 
  PlusCircle, 
  Settings, 
  User,
  Video,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Announcement, SchoolEvent, Schedule } from './types';
import Announcements from './components/Announcements';
import ScheduleWidget from './components/ScheduleWidget';
import EventsWidget from './components/EventsWidget';
import VeoGenerator from './components/VeoGenerator';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, evRes, schRes] = await Promise.all([
          fetch('/api/announcements'),
          fetch('/api/events'),
          fetch('/api/schedules')
        ]);
        
        setAnnouncements(await annRes.json());
        setEvents(await evRes.json());
        setSchedules(await schRes.json());
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_ANNOUNCEMENT') {
        setAnnouncements(prev => [data.payload, ...prev]);
      }
    };

    return () => ws.close();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'schedule', label: 'Class Schedule', icon: Clock },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'media', label: 'School Media', icon: Video },
    { id: 'admin', label: 'Admin Panel', icon: PlusCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-indigo-600 tracking-tight"
            >
              EduPulse
            </motion.h1>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : ''} />
              {isSidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
            <Settings size={20} />
            {isSidebarOpen && <span className="ml-3">Settings</span>}
          </button>
          <div className="mt-4 flex items-center p-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              JD
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-slate-500 truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-800">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <User size={20} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Megaphone className="mr-2 text-indigo-600" size={20} />
                          Latest Announcements
                        </h3>
                        <button 
                          onClick={() => setActiveTab('announcements')}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      <Announcements announcements={announcements.slice(0, 3)} />
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Clock className="mr-2 text-indigo-600" size={20} />
                          Today's Schedule
                        </h3>
                        <button 
                          onClick={() => setActiveTab('schedule')}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Full schedule
                        </button>
                      </div>
                      <ScheduleWidget schedules={schedules} />
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Calendar className="mr-2 text-indigo-600" size={20} />
                          Upcoming Events
                        </h3>
                      </div>
                      <EventsWidget events={events} />
                    </section>

                    <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Video className="mr-2" size={20} />
                        School Highlights
                      </h3>
                      <p className="text-indigo-100 text-sm mb-4">
                        Generate cinematic highlights of school activities using AI.
                      </p>
                      <button 
                        onClick={() => setActiveTab('media')}
                        className="w-full py-2 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
                      >
                        Try Veo AI
                      </button>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <Announcements announcements={announcements} />
                </div>
              )}

              {activeTab === 'schedule' && (
                <ScheduleWidget schedules={schedules} fullWidth />
              )}

              {activeTab === 'events' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map(event => (
                    <div key={event.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Calendar size={24} />
                        </div>
                        <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded-full text-slate-500">
                          {event.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                      <p className="text-slate-600 text-sm mb-4">{event.description}</p>
                      <div className="flex items-center text-slate-500 text-xs space-x-4">
                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {event.time}</span>
                        <span className="flex items-center"><LayoutDashboard size={14} className="mr-1" /> {event.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'media' && <VeoGenerator />}

              {activeTab === 'admin' && (
                <AdminPanel onAnnouncementCreated={(newAnn) => setAnnouncements(prev => [newAnn, ...prev])} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
