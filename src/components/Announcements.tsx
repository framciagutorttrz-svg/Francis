import { Announcement } from '../types';
import { AlertTriangle, Info, Bell, User, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface AnnouncementsProps {
  announcements: Announcement[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-50',
          border: 'border-red-100',
          text: 'text-red-700',
          icon: <AlertTriangle className="text-red-500" size={20} />,
          label: 'Urgent'
        };
      case 'reminder':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-700',
          icon: <Bell className="text-amber-500" size={20} />,
          label: 'Reminder'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          text: 'text-blue-700',
          icon: <Info className="text-blue-500" size={20} />,
          label: 'Notice'
        };
    }
  };

  if (announcements.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        No announcements at this time.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((ann, index) => {
        const styles = getTypeStyles(ann.type);
        return (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-2xl border ${styles.border} ${styles.bg} shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {styles.icon}
                </div>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
                    {styles.label}
                  </span>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">
                    {ann.title}
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-xs text-slate-500 font-medium">
                  <Clock size={12} className="mr-1" />
                  {new Date(ann.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="prose prose-slate prose-sm max-w-none text-slate-700 mb-4">
              <ReactMarkdown>{ann.content}</ReactMarkdown>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mr-2">
                  <User size={12} />
                </div>
                Posted by <span className="font-semibold ml-1">{ann.author}</span>
              </div>
              <button className={`text-xs font-bold ${styles.text} hover:underline`}>
                Read more
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
