import { useState } from 'react';
import { Send, Megaphone, AlertTriangle, Info, Bell, Loader2, CheckCircle2 } from 'lucide-react';
import { Announcement } from '../types';
import { supabaseService } from '../services/supabaseService';

interface AdminPanelProps {
  onAnnouncementCreated: (ann: Announcement) => void;
}

export default function AdminPanel({ onAnnouncementCreated }: AdminPanelProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'urgent' | 'general' | 'reminder'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      let newAnn: Announcement;
      
      if (isSupabaseConfigured) {
        newAnn = await supabaseService.createAnnouncement({
          title,
          content,
          type,
          author: 'Admin Office'
        });
      } else {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            type,
            author: 'Admin Office'
          })
        });
        
        if (!res.ok) throw new Error('Failed to create announcement');
        newAnn = await res.json();
      }

      onAnnouncementCreated(newAnn);
      setTitle('');
      setContent('');
      setType('general');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to create announcement", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Megaphone size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Create Announcement</h3>
            <p className="text-slate-500 text-sm">Send updates to students, teachers, and parents.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Message Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                { id: 'general', label: 'General', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                { id: 'reminder', label: 'Reminder', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    type === t.id 
                      ? `${t.border} ${t.bg} ${t.color} scale-[1.02]` 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <t.icon size={24} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Announcement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Upcoming Science Fair"
              className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Content (Markdown supported)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement here..."
              className="w-full h-48 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${
              isSubmitting 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : success ? (
              <>
                <CheckCircle2 size={20} />
                <span>Sent Successfully!</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Broadcast Announcement</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
