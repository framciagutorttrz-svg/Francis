import { Schedule } from '../types';
import { Clock, MapPin, User } from 'lucide-react';

interface ScheduleWidgetProps {
  schedules: Schedule[];
  fullWidth?: boolean;
}

export default function ScheduleWidget({ schedules, fullWidth }: ScheduleWidgetProps) {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedules = schedules.filter(s => s.day_of_week === currentDay);

  if (todaySchedules.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        No classes scheduled for today.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${fullWidth ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
      {todaySchedules.map((item) => (
        <div 
          key={item.id} 
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {item.start_time} - {item.end_time}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
              {item.room}
            </span>
          </div>
          
          <h4 className="font-bold text-slate-900 text-lg mb-4 group-hover:text-indigo-600 transition-colors">
            {item.class_name}
          </h4>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center text-sm text-slate-600">
              <User size={14} className="mr-2 text-slate-400" />
              {item.teacher}
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <MapPin size={14} className="mr-2 text-slate-400" />
              {item.room}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
