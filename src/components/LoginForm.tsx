import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowRight, Sparkles, GraduationCap, UserCircle, Users, ShieldCheck, BookOpen } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: { name: string; role: string }) => void;
}

type Role = 'Student' | 'Teacher' | 'Administrator' | 'Parent';

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Student');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const roles: { id: Role; label: string; icon: any }[] = [
    { id: 'Student', label: 'Student', icon: BookOpen },
    { id: 'Teacher', label: 'Teacher', icon: Users },
    { id: 'Administrator', label: 'Admin', icon: ShieldCheck },
    { id: 'Parent', label: 'Parent', icon: UserCircle },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSuccess(true);
    
    // Wait for success animation
    await new Promise(resolve => setTimeout(resolve, 800));
    onLogin({ name: mode === 'register' ? name : 'John Doe', role: role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-violet-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-white p-8 md:p-12 relative overflow-hidden">
          {/* Success Overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center text-center p-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6"
                >
                  <Sparkles size={40} />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {mode === 'login' ? 'Welcome Back!' : 'Account Created!'}
                </h2>
                <p className="text-slate-500">Preparing your {role.toLowerCase()} dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 mb-6"
            >
              <GraduationCap size={32} />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Arellano Elisa Esguerra</h1>
            <p className="text-slate-500 font-medium">
              {mode === 'login' ? 'Sign in to your account' : 'Create your school account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 ml-1">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-center space-x-3 p-3 rounded-2xl border-2 transition-all ${
                      role === r.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-200'
                    }`}
                  >
                    <r.icon size={18} />
                    <span className="text-sm font-bold">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <UserCircle size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 focus:border-indigo-600 focus:bg-white rounded-2xl transition-all outline-none text-slate-900 placeholder:text-slate-400"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 focus:border-indigo-600 focus:bg-white rounded-2xl transition-all outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="name@school.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 focus:border-indigo-600 focus:bg-white rounded-2xl transition-all outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center space-x-2">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <span>{mode === 'login' ? `Sign In as ${role}` : 'Create Account'}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-bold text-indigo-600 hover:text-indigo-700"
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
            &copy; 2026 Arellano Elisa Esguerra Systems &bull; v2.4.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
