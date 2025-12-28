
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Save, Wand2, Paperclip, X, ShieldAlert, Sparkles, MapPin, Calendar, Clock, RefreshCw, Edit3, CheckCircle2 } from 'lucide-react';
import { AvisData, IncidentStatus, IncidentType } from '../types';
import { analyzeIncident } from '../services/geminiService';
import { saveAvis, getAllAvis } from '../services/db';

export const AvisScanner = ({ onSave, onCancel, initialData }: any) => {
  const [fileData, setFileData] = useState<string | null>(initialData?.document_image || null);
  const [mimeType, setMimeType] = useState<string>(initialData?.mimeType || "image/jpeg");
  const [auxImages, setAuxImages] = useState<string[]>(initialData?.aux_images || []);
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(!!initialData);
  const [isRevision, setIsRevision] = useState(false);
  const [formData, setFormData] = useState<Partial<AvisData>>(initialData || {
    id: "Génération...",
    fait_a: "Tahannaout",
    fait_le: new Date().toLocaleDateString('fr-FR'),
    statut: IncidentStatus.SUIVRE,
    nature_incident: IncidentType.AUTRE,
    date_iso: new Date().toISOString().split('T')[0],
    victime_objet: "",
    description_sinistre: "",
    lieu_date_heure: "",
    dommages: "",
    causes_circonstances: "",
    responsabilites: "",
    mesures_prises: "",
    references_autorites: "",
    observations: "",
    rapport_introduction: "",
    rapport_analyse_technique: "",
    rapport_conclusion: ""
  });

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auxInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialData && showForm) updateId();
  }, [showForm]);

  const updateId = async () => {
    const docs = await getAllAvis();
    const now = new Date();
    const mmYY = now.toLocaleDateString('fr-FR').slice(3, 5) + now.toLocaleDateString('fr-FR').slice(8, 10);
    const prefix = `SRM-MS/DPH/AI-${mmYY}`;
    const count = docs.filter(d => d.id.startsWith(prefix)).length + 1;
    setFormData(prev => ({ ...prev, id: `${prefix}-${String(count).padStart(3, '0')}` }));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setFileData(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const performAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeIncident(fileData, mimeType, userText);
      setFormData(prev => ({ ...prev, ...result }));
      setShowForm(true);
    } catch (e) { 
        alert("Erreur lors de l'analyse IA. Vérifiez votre clé API."); 
        setShowForm(true); 
    } finally { setAnalyzing(false); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveAvis({
        ...(formData as AvisData),
        document_image: fileData || "",
        aux_images: auxImages,
        created_at: initialData?.created_at || Date.now()
      });
      onSave();
    } catch (e) { alert("Erreur lors de l'enregistrement du dossier."); }
    finally { setLoading(false); }
  };

  if (!showForm && !analyzing) {
    return (
      <div className="h-full bg-white dark:bg-slate-950 p-6 overflow-y-auto">
        <div className="flex flex-col items-center mb-10 mt-4">
          <ShieldAlert size={64} className="text-[#FF6B00] mb-4 drop-shadow-lg" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Expertise Incident</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Plateforme Multi-Risques Mizami</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center bg-[#FF6B00] text-white p-8 rounded-[2.5rem] shadow-xl active:scale-95 transition-all"><Camera size={32}/><span className="text-[10px] font-black mt-2 uppercase">Camera</span></button>
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center bg-slate-800 text-white p-8 rounded-[2.5rem] shadow-xl active:scale-95 transition-all"><Upload size={32}/><span className="text-[10px] font-black mt-2 uppercase">Importer</span></button>
        </div>
        <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Notes préliminaires</label>
            <textarea 
                className="w-full p-5 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] text-sm outline-none focus:ring-2 ring-[#FF6B00]/50" 
                placeholder="Décrivez brièvement l'incident ou ajoutez un témoignage..." 
                rows={4} 
                value={userText} 
                onChange={e => setUserText(e.target.value)} 
            />
        </div>
        <div className="mt-8 space-y-4">
            <button onClick={performAnalysis} disabled={!fileData && !userText} className="w-full bg-[#FF6B00] text-white py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl disabled:opacity-30 active:scale-[0.98] transition-all">
                <Wand2 size={20}/> ANALYSER VIA IA
            </button>
            <button onClick={() => setShowForm(true)} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Saisie Manuelle Experte</button>
        </div>
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
        <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>
    );
  }

  if (analyzing) return (
    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-[#FF6B00] font-black space-y-6">
        <div className="relative">
            <Loader2 size={80} className="animate-spin mb-4 opacity-20"/>
            <ShieldAlert size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"/>
        </div>
        <div className="text-center">
            <p className="text-xl uppercase tracking-tighter">Analyse Experte en cours...</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Génération du rapport d'enquête</p>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5] dark:bg-slate-900 transition-colors">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-slate-950 p-4 border-b dark:border-slate-800 flex justify-between items-center z-10">
        <button onClick={onCancel} className="p-2 text-slate-400"><X size={24}/></button>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsRevision(!isRevision)} 
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isRevision ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
            >
                <Edit3 size={14}/> {isRevision ? "En cours de révision" : "Révision"}
            </button>
            <button 
                onClick={performAnalysis} 
                className="p-2 bg-slate-100 dark:bg-slate-800 text-[#FF6B00] rounded-full active:rotate-180 transition-transform duration-500"
                title="Actualiser via IA"
            >
                <RefreshCw size={18}/>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-48 space-y-4">
        {/* Identité */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-orange-100 dark:border-slate-700 shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <label className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">Référence Officielle Mizami</label>
             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${formData.statut === IncidentStatus.SUIVRE ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {formData.statut}
             </span>
           </div>
           <input className="w-full bg-transparent font-black text-xl text-slate-900 dark:text-white outline-none" value={formData?.id} readOnly />
        </div>

        {/* Section 1: Constat */}
        <SectionTitle title="1. Constat de l'Incident" icon={ShieldAlert} />
        <div className="grid grid-cols-1 gap-4">
            <Field label="Victime ou Objet concerné" value={formData?.victime_objet} onChange={(v: string) => setFormData({...formData, victime_objet: v})} />
            <Field label="Description détaillée du sinistre" value={formData?.description_sinistre} isTextarea onChange={(v: string) => setFormData({...formData, description_sinistre: v})} />
            <Field label="Lieu, Date et Heure précises" value={formData?.lieu_date_heure} icon={MapPin} onChange={(v: string) => setFormData({...formData, lieu_date_heure: v})} />
            <Field label="Dommages constatés" value={formData?.dommages} isTextarea onChange={(v: string) => setFormData({...formData, dommages: v})} />
        </div>

        {/* Media */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Preuves & Photos Annexes</label>
          <div className="flex gap-3 flex-wrap">
            {fileData && (
                <div className="w-20 h-20 rounded-[1rem] overflow-hidden border-2 border-[#FF6B00] relative">
                    <img src={fileData} className="w-full h-full object-cover"/>
                    <span className="absolute bottom-0 inset-x-0 bg-[#FF6B00] text-white text-[8px] font-black text-center py-0.5">PRINCIPALE</span>
                </div>
            )}
            {auxImages.map((img: string, i: number) => (
                <div key={i} className="w-20 h-20 rounded-[1rem] overflow-hidden border relative group">
                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                    <button onClick={() => setAuxImages(auxImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10}/>
                    </button>
                </div>
            ))}
            {auxImages.length < 3 && (
                <button onClick={() => auxInputRef.current?.click()} className="w-20 h-20 rounded-[1rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-300 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-colors">
                    <Paperclip size={24}/>
                    <span className="text-[8px] font-black mt-1 uppercase">Ajouter</span>
                </button>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" ref={auxInputRef} onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const r = new FileReader(); r.onloadend = () => setAuxImages([...auxImages, r.result as string]); r.readAsDataURL(file);
            }
          }} />
        </div>

        {/* Section 2: Analyse */}
        <SectionTitle title="2. Analyse & Responsabilités" icon={Sparkles} />
        <div className="grid grid-cols-1 gap-4">
            <Field label="Causes et Circonstances" value={formData?.causes_circonstances} isTextarea onChange={(v: string) => setFormData({...formData, causes_circonstances: v})} />
            <Field label="Responsabilités établies" value={formData?.responsabilites} isTextarea onChange={(v: string) => setFormData({...formData, responsabilites: v})} />
            <Field label="Mesures immédiates prises" value={formData?.mesures_prises} isTextarea onChange={(v: string) => setFormData({...formData, mesures_prises: v})} />
            <Field label="Références Autorités (PV, etc.)" value={formData?.references_autorites} onChange={(v: string) => setFormData({...formData, references_autorites: v})} />
        </div>

        {/* Section 3: Rapport Expert IA */}
        <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF9E00] p-0.5 rounded-[2.2rem] shadow-xl">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Wand2 size={18} className="text-[#FF6B00]"/>
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Rapport d'Enquête Algorithmique</h4>
                </div>
                <Field label="Introduction du Rapport" value={formData?.rapport_introduction} isTextarea onChange={(v: string) => setFormData({...formData, rapport_introduction: v})} />
                <Field label="Analyse Technique Experte" value={formData?.rapport_analyse_technique} isTextarea onChange={(v: string) => setFormData({...formData, rapport_analyse_technique: v})} />
                <Field label="Conclusion & Préconisations" value={formData?.rapport_conclusion} isTextarea onChange={(v: string) => setFormData({...formData, rapport_conclusion: v})} />
            </div>
        </div>

        {/* Section 4: Finalisation */}
        <SectionTitle title="3. Finalisation" icon={CheckCircle2} />
        <div className="grid grid-cols-1 gap-4">
            <Field label="Observations Diverses" value={formData?.observations} isTextarea onChange={(v: string) => setFormData({...formData, observations: v})} />
            <div className="grid grid-cols-2 gap-4">
                <Field label="Fait à" value={formData?.fait_a} onChange={(v: string) => setFormData({...formData, fait_a: v})} />
                <Field label="Fait le" value={formData?.fait_le} onChange={(v: string) => setFormData({...formData, fait_le: v})} />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nature de l'Incident</label>
                <select 
                    className="w-full bg-transparent font-bold text-sm outline-none dark:text-white"
                    value={formData.nature_incident}
                    onChange={e => setFormData({...formData, nature_incident: e.target.value as IncidentType})}
                >
                    {Object.values(IncidentType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Statut du Dossier</label>
                <div className="flex gap-2">
                    {[IncidentStatus.SUIVRE, IncidentStatus.CLASSER].map(s => (
                        <button 
                            key={s} 
                            onClick={() => setFormData({...formData, statut: s})}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.statut === s ? 'bg-[#FF6B00] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Save Button - Remonté pour meilleure ergonomie sur mobile (bottom-24) */}
      <div className="fixed bottom-24 left-6 right-6 z-40">
        <button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full bg-slate-900 dark:bg-[#FF6B00] text-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} 
          <span className="tracking-tight uppercase">Valider l'expertise</span>
        </button>
      </div>
    </div>
  );
};

const SectionTitle = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-3 pt-6 pb-2">
        <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
            <Icon size={16}/>
        </div>
        <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{title}</h3>
    </div>
);

const Field = ({ label, value, onChange, isTextarea, icon: Icon }: any) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.8rem] shadow-sm border border-slate-100 dark:border-slate-700 group focus-within:border-[#FF6B00] transition-colors">
    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[#FF6B00]"/>}
        {label}
    </label>
    {isTextarea ? (
        <textarea 
            className="w-full bg-transparent font-bold text-sm outline-none dark:text-white leading-relaxed resize-none" 
            rows={value && value.length > 100 ? 5 : 3} 
            value={value || ""} 
            onChange={e => onChange(e.target.value)} 
            placeholder={`Saisir ${label.toLowerCase()}...`}
        />
    ) : (
        <input 
            className="w-full bg-transparent font-bold text-sm outline-none dark:text-white" 
            value={value || ""} 
            onChange={e => onChange(e.target.value)} 
            placeholder={`Saisir ${label.toLowerCase()}...`}
        />
    )}
  </div>
);
