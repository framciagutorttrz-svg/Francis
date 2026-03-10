import { SchoolEvent } from '../types';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface EventsWidgetProps {
  events: SchoolEvent[];
}

export default function EventsWidget({ events }: EventsWidgetProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} />
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-2">No upcoming events</h4>
        <p className="text-slate-500">Stay tuned for future school activities and meetings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.slice(0, 4).map((event) => (
        <div 
          key={event.id} 
          className="flex items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex-shrink-0 w-14 h-14 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <span className="text-xs font-bold uppercase">
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-xl font-black leading-none">
              {new Date(event.date).getDate()}
            </span>
          </div>
          
          <div className="ml-4 flex-1">
            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {event.title}
            </h4>
            <div className="flex items-center mt-1 space-x-3 text-xs text-slate-500">
              <span className="flex items-center">
                <Clock size={12} className="mr-1" />
                {event.time}
              </span>
              <span className="flex items-center">
                <MapPin size={12} className="mr-1" />
                {event.location}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
