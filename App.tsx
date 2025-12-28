
import React, { useState, useEffect, useRef } from 'react';
import { Scanner } from './components/Scanner';
import { CheckScanner } from './components/CheckScanner';
import { AvisScanner } from './components/AvisScanner';
import { Dashboard } from './components/Dashboard';
import { CheckDashboard } from './components/CheckDashboard';
import { AvisDashboard } from './components/AvisDashboard';
import { Statistics } from './components/Statistics';
import { CheckStatistics } from './components/CheckStatistics';
import { AvisStatistics } from './components/AvisStatistics';
import { Settings } from './components/Settings';
import { ScreenName, DocumentData, RejectedCheck, AvisData, AppModule } from './types';
import { Camera, List, BarChart2, Settings as SettingsIcon, CreditCard, Mail, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>('dashboard');
  const [module, setModule] = useState<AppModule>('courriers');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [enableReminders, setEnableReminders] = useState<boolean>(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem('THEME') as 'light' | 'dark';
    if (storedTheme) setTheme(storedTheme);
    
    const storedModule = localStorage.getItem('LAST_MODULE') as AppModule;
    if (storedModule) setModule(storedModule);

    const storedReminders = localStorage.getItem('REMINDERS');
    if (storedReminders !== null) setEnableReminders(storedReminders === 'true');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('THEME', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('REMINDERS', String(enableReminders));
  }, [enableReminders]);

  useEffect(() => {
    localStorage.setItem('LAST_MODULE', module);
  }, [module]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setScreen('scanner');
  };

  const currentBgClass = module === 'courriers' ? 'bg-lavande' : module === 'cheques' ? 'bg-beurre' : 'bg-[#F5F5F5]';
  const accentColor = module === 'courriers' ? 'text-teal' : module === 'cheques' ? 'text-citron' : 'text-[#FF6B00]';

  return (
    <div className={`h-[100dvh] w-full flex flex-col ${currentBgClass} dark:bg-slate-950 max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-300`}>
        
        {/* Switcher 3 modules */}
        <div className="bg-white dark:bg-slate-900 px-2 py-3 border-b border-gray-100 dark:border-slate-800 shrink-0 z-50">
            <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl flex">
                <button onClick={() => { setModule('courriers'); setScreen('dashboard'); }} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${module === 'courriers' ? 'bg-white dark:bg-slate-700 text-[#0ABAB5] shadow-sm' : 'text-gray-400'}`}>
                    <div className="flex flex-col items-center"><Mail size={14}/><span className="mt-1">COURRIERS</span></div>
                </button>
                <button onClick={() => { setModule('cheques'); setScreen('dashboard'); }} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${module === 'cheques' ? 'bg-white dark:bg-slate-700 text-[#84cc16] shadow-sm' : 'text-gray-400'}`}>
                    <div className="flex flex-col items-center"><CreditCard size={14}/><span className="mt-1">CHÈQUES</span></div>
                </button>
                <button onClick={() => { setModule('avis'); setScreen('dashboard'); }} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${module === 'avis' ? 'bg-white dark:bg-slate-700 text-[#FF6B00] shadow-sm' : 'text-gray-400'}`}>
                    <div className="flex flex-col items-center"><ShieldAlert size={14}/><span className="mt-1">AVIS/AI</span></div>
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
            {screen === 'scanner' && (
                module === 'courriers' ? <Scanner onSave={() => setScreen('dashboard')} onCancel={() => setScreen('dashboard')} initialData={editingItem} /> :
                module === 'cheques' ? <CheckScanner onSave={() => setScreen('dashboard')} onCancel={() => setScreen('dashboard')} initialData={editingItem} /> :
                <AvisScanner onSave={() => setScreen('dashboard')} onCancel={() => setScreen('dashboard')} initialData={editingItem} />
            )}
            {screen === 'dashboard' && (
                module === 'courriers' ? <Dashboard onEdit={handleEdit} /> :
                module === 'cheques' ? <CheckDashboard onEdit={handleEdit} /> :
                <AvisDashboard onEdit={handleEdit} />
            )}
            {screen === 'stats' && (
                module === 'courriers' ? <Statistics /> :
                module === 'cheques' ? <CheckStatistics /> :
                <AvisStatistics />
            )}
            {screen === 'settings' && (
                <Settings 
                  theme={theme} 
                  setTheme={setTheme} 
                  enableReminders={enableReminders}
                  setEnableReminders={setEnableReminders}
                />
            )}
        </div>

        <div className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 shrink-0 pb-safe">
            <button onClick={() => setScreen('dashboard')} className={`p-3 rounded-2xl ${screen === 'dashboard' ? accentColor : 'text-gray-300'}`}><List size={28} /></button>
            <button onClick={() => { setScreen('scanner'); setEditingItem(null); }} className={`p-3 rounded-2xl ${screen === 'scanner' ? accentColor : 'text-gray-300'}`}><Camera size={28} /></button>
            <button onClick={() => setScreen('stats')} className={`p-3 rounded-2xl ${screen === 'stats' ? accentColor : 'text-gray-300'}`}><BarChart2 size={28} /></button>
            <button onClick={() => setScreen('settings')} className={`p-3 rounded-2xl ${screen === 'settings' ? accentColor : 'text-gray-300'}`}><SettingsIcon size={28} /></button>
        </div>
    </div>
  );
};

export default App;
