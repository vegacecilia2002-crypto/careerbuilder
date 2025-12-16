import React from 'react';
import { LayoutDashboard, Briefcase, FileText, Settings, UserCircle, Menu, FileUser, Camera, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ClaireChat } from './ClaireChat';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-emerald-50 text-emerald-600 font-medium' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-900'} />
    <span>{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();

  const isResumeBuilder = location.pathname === '/resume';

  return (
    <div className="min-h-screen h-[100dvh] bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Hidden on print */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block print:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">JobFlow</span>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" active={location.pathname === '/'} />
            <SidebarItem icon={Briefcase} label="My Applications" to="/applications" active={location.pathname === '/applications'} />
            <SidebarItem icon={FileUser} label="Resume Builder" to="/resume" active={location.pathname === '/resume'} />
            <SidebarItem icon={Camera} label="Avatar Studio" to="/avatar" active={location.pathname === '/avatar'} />
            <SidebarItem icon={FileText} label="Offers Received" to="/offers" active={location.pathname === '/offers'} />
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />
            
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  {user?.name?.charAt(0) || <UserCircle size={20} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate text-slate-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative h-full">
        {/* Mobile Header - Hidden on print */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 print:hidden shrink-0">
           <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white rounded-full"></div>
            </div>
            <span className="font-bold text-slate-900">JobFlow</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </div>

        {/* Scroll Area - Optimized for Resume Builder */}
        <div className={`flex-1 overflow-y-auto ${isResumeBuilder ? 'p-2 md:p-4 md:pr-2' : 'p-4 md:p-8'} print:p-0 print:overflow-visible`}>
          <div className={`${isResumeBuilder ? 'max-w-[1800px] w-full h-full' : 'max-w-7xl'} mx-auto print:max-w-none print:mx-0 transition-all duration-300`}>
            {children}
          </div>
        </div>

        {/* Claire Chat Overlay */}
        <div className="print:hidden">
           <ClaireChat />
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden print:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};