
import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, Edit, Trash2, Printer, ShieldAlert, FileText, Loader2, X, AlertTriangle } from 'lucide-react';
import { AvisData, IncidentStatus } from '../types';
import { getAllAvis, deleteAvis } from '../services/db';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

export const AvisDashboard = ({ onEdit }: { onEdit: (a: AvisData) => void }) => {
  const [avis, setAvis] = useState<AvisData[]>([]);
  const [filtered, setFiltered] = useState<AvisData[]>([]);
  const [search, setSearch] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  
  useEffect(() => {
    const l = search.toLowerCase();
    setFiltered(avis.filter(a => 
        a.id.toLowerCase().includes(l) || 
        (a.victime_objet || "").toLowerCase().includes(l) || 
        (a.description_sinistre || "").toLowerCase().includes(l) ||
        (a.nature_incident || "").toLowerCase().includes(l)
    ));
  }, [search, avis]);

  const load = async () => { 
    const data = await getAllAvis(); 
    setAvis(data); 
    setFiltered(data); 
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
        await deleteAvis(deleteTargetId);
        setDeleteTargetId(null);
        load();
    } catch (e) {
        alert("Erreur lors de la suppression.");
    }
  };

  const handlePrint = async (a: AvisData, e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpenId(null);
      setGeneratingPdf(true);

      try {
          const container = document.createElement('div');
          container.style.position = 'fixed';
          container.style.top = '-10000px';
          container.style.width = '210mm';
          container.style.backgroundColor = 'white';
          container.style.fontFamily = '"Arial", sans-serif';
          
          const safe = (val: any) => val || "Non communiqué";
          
          container.innerHTML = `
            <style>
                .pdf-page { width: 210mm; height: 297mm; padding: 15mm; box-sizing: border-box; position: relative; background: white; border-bottom: 1px solid #eee; }
                .avis-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .avis-table td { border: 1px solid #ccc; padding: 8px; font-size: 11px; vertical-align: top; }
                .avis-table .label-cell { width: 35%; font-weight: bold; }
                .report-section { margin-bottom: 15px; }
                .report-title { font-weight: bold; font-size: 12px; margin-bottom: 4px; text-decoration: underline; }
                .report-text { font-size: 11px; line-height: 1.4; color: #333; text-align: justify; }
            </style>

            <!-- PAGE 1: AVIS D'INCIDENT -->
            <div class="pdf-page">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 17px; font-weight: bold; text-transform: uppercase;">MONSIEUR LE DIRECTEUR GÉNÉRAL</h2>
                    <h3 style="margin: 8px 0 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">AVIS D'INCIDENT N°: ${a.id}</h3>
                </div>

                <table class="avis-table">
                    <tr><td class="label-cell">1-Victime ou objet du sinistre</td><td>${safe(a.victime_objet)}</td></tr>
                    <tr><td class="label-cell">2-Description du sinistre</td><td>${safe(a.description_sinistre)}</td></tr>
                    <tr><td class="label-cell">3-Lieu, date et heure du sinistre</td><td>${safe(a.lieu_date_heure)}</td></tr>
                    <tr><td class="label-cell">4-Dommages (nature et évaluation sommaire)</td><td>${safe(a.dommages)}</td></tr>
                    <tr><td class="label-cell">5-Causes et circonstances détaillées</td><td>${safe(a.causes_circonstances)}</td></tr>
                    <tr><td class="label-cell">6-Responsabilités</td><td>${safe(a.responsabilites)}</td></tr>
                    <tr><td class="label-cell">7-Mesures prises pour la limitation ou réparation</td><td>${safe(a.mesures_prises)}</td></tr>
                    <tr><td class="label-cell">8-Références (autorités, dépôt de plainte)</td><td>${safe(a.references_autorites)}</td></tr>
                    <tr><td class="label-cell">9-Observations</td><td>${safe(a.observations)}</td></tr>
                </table>

                <div style="text-align: center; margin-top: 20px; font-size: 11px; font-weight: bold;">
                    Fait à : ${a.fait_a} &nbsp;&nbsp; Le : ${a.fait_le}
                </div>

                <!-- Signatures remontées (réduction massive de l'espace) -->
                <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 11px; font-weight: bold;">
                    <div style="width: 45%; text-align: center; border-top: 1px solid #eee; padding-top: 5px;">Signature du Chef de l'entité</div>
                    <div style="width: 45%; text-align: center; border-top: 1px solid #eee; padding-top: 5px;">Signature du Chef de Département</div>
                </div>
            </div>

            <!-- PAGE 2: RAPPORT D'ENQUÊTE FORCÉ -->
            <div class="pdf-page">
                <!-- Espace d'en-tête vide (pas de logo ni texte comme demandé) -->
                <div style="height: 50px;"></div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #333;">RAPPORT D'ENQUÊTE</h2>
                </div>

                <div class="report-section">
                    <div class="report-title">Introduction</div>
                    <div class="report-text">${safe(a.rapport_introduction)}</div>
                </div>

                <div class="report-section">
                    <div class="report-title">Analyse technique</div>
                    <div class="report-text">${safe(a.rapport_analyse_technique)}</div>
                </div>

                <div class="report-section">
                    <div class="report-title">Analyse des causes</div>
                    <div class="report-text">${safe(a.causes_circonstances)}</div>
                </div>

                <div class="report-section">
                    <div class="report-title">Responsabilités</div>
                    <div class="report-text">${safe(a.responsabilites)}</div>
                </div>

                <div class="report-section">
                    <div class="report-title">Actions correctives</div>
                    <div class="report-text">${safe(a.mesures_prises)}</div>
                </div>

                <div class="report-section">
                    <div class="report-title">Recommandations</div>
                    <div class="report-text">${safe(a.rapport_conclusion)}</div>
                </div>

                <div class="report-section" style="margin-top: 20px;">
                    <div class="report-title">Conclusion</div>
                    <div class="report-text">L'incident a été traité selon les normes techniques SRM. Le dossier est transmis pour archivage et suite administrative.</div>
                </div>
            </div>
          `;

          document.body.appendChild(container);
          
          const canvas = await html2canvas(container, { 
              scale: 2,
              useCORS: true,
              logging: false,
              windowWidth: 794
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          const imgProps = pdf.getImageProperties(imgData);
          const canvasHeightInMm = (imgProps.height * pdfWidth) / imgProps.width;
          
          let remainingHeight = canvasHeightInMm;
          let position = 0;
          
          // Page 1
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, canvasHeightInMm);
          remainingHeight -= pdfHeight;
          
          // Page 2 (Le rapport d'enquête)
          if (remainingHeight > 0) {
              position -= pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, canvasHeightInMm);
              remainingHeight -= pdfHeight;
          }
          
          // Annexes
          if (a.document_image || (a.aux_images && a.aux_images.length > 0)) {
              pdf.addPage();
              pdf.setFontSize(16);
              pdf.setTextColor(0);
              pdf.setFont('helvetica', 'bold');
              pdf.text("ANNEXES PHOTOGRAPHIQUES", pdfWidth / 2, 20, { align: 'center' });
              
              let yPos = 40;
              const imgW = 160;
              const xPos = (pdfWidth - imgW) / 2;

              if (a.document_image) {
                  try {
                      const props = pdf.getImageProperties(a.document_image);
                      const imgH = (props.height * imgW) / props.width;
                      pdf.addImage(a.document_image, 'JPEG', xPos, yPos, imgW, imgH);
                      yPos += imgH + 20;
                  } catch(e) {}
              }

              if (a.aux_images && a.aux_images.length > 0) {
                  for (let auxImg of a.aux_images) {
                      if (yPos > 240) { pdf.addPage(); yPos = 30; }
                      try {
                          const props = pdf.getImageProperties(auxImg);
                          const imgH = (props.height * imgW) / props.width;
                          pdf.addImage(auxImg, 'JPEG', xPos, yPos, imgW, imgH);
                          yPos += imgH + 20;
                      } catch(e) {}
                  }
              }
          }

          document.body.removeChild(container);
          pdf.save(`Expertise_Mizami_${a.id}.pdf`);
      } catch (err) {
          console.error(err);
          alert("Erreur lors de la génération de l'expertise PDF.");
      } finally {
          setGeneratingPdf(false);
      }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
    setMenuOpenId(null);
  };

  return (
    <div className="h-full bg-[#F8F9FA] dark:bg-slate-950 flex flex-col">
      {generatingPdf && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
              <Loader2 className="animate-spin mb-4 text-[#FF6B00]" size={50} />
              <p className="font-black uppercase tracking-widest text-xs">Génération Expertise Officielle...</p>
          </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-5 shadow-sm z-10 transition-colors duration-300">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Dossiers Avis</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mizami Incident Management</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="text-[#FF6B00]" size={24} />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 ring-orange-500/30 dark:text-white transition-all" 
            placeholder="Rechercher incident, n° avis, objet..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700">
                <FileText size={64} className="mb-4 opacity-20"/>
                <p className="font-bold uppercase tracking-widest text-xs">Aucun dossier trouvé</p>
            </div>
        )}

        {filtered.map(a => (
          <div 
            key={a.id} 
            onClick={() => onEdit(a)} 
            className="bg-white dark:bg-slate-900/60 rounded-[2rem] p-5 shadow-sm border-l-4 border-[#FF6B00] active:scale-[0.98] transition-all relative group hover:shadow-md border border-slate-100 dark:border-slate-800"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-[#FF6B00] bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full uppercase tracking-tighter">{a.id}</span>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${a.statut === IncidentStatus.CLASSER ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {a.statut}
                  </span>
                </div>
                <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight uppercase tracking-tight line-clamp-1">{a.victime_objet || "Sans titre"}</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === a.id ? null : a.id); }}
                className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <MoreVertical size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-medium">{a.description_sinistre || "Aucune description"}</p>
            
            <div className="flex justify-between items-center pt-4 border-t dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{a.fait_le} • {a.nature_incident}</span>
              </div>
              <div className="flex items-center gap-1">
                {a.document_image && <div className="w-5 h-5 rounded-md overflow-hidden border border-slate-200"><img src={a.document_image} className="w-full h-full object-cover"/></div>}
                {a.aux_images && a.aux_images.length > 0 && <span className="text-[8px] font-black text-slate-400">+{a.aux_images.length}</span>}
              </div>
            </div>

            {/* Floating Menu */}
            {menuOpenId === a.id && (
                <div className="absolute right-4 top-12 bg-white dark:bg-slate-900 shadow-2xl border border-gray-100 dark:border-slate-800 rounded-2xl z-30 flex flex-col w-48 py-2 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(a); setMenuOpenId(null); }} className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-bold text-gray-700 dark:text-gray-100 transition-colors">
                        <Edit size={16} className="mr-3 text-[#FF6B00]" /> Réviser
                    </button>
                    <button onClick={(e) => handlePrint(a, e)} className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-bold text-gray-700 dark:text-gray-100 transition-colors">
                        <Printer size={16} className="mr-3 text-slate-400" /> Export PDF
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-slate-700 mx-2 my-1"></div>
                    <button onClick={(e) => handleDelete(a.id, e)} className="flex items-center px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold text-red-600 transition-colors">
                        <Trash2 size={16} className="mr-3" /> Supprimer
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>

      {deleteTargetId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-sm:max-w-xs max-w-sm overflow-hidden border border-transparent dark:border-slate-800 p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase mb-2">Confirmer Suppression</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Ce dossier d'incident sera définitivement effacé.</p>
                  <div className="flex gap-4">
                      <button onClick={() => setDeleteTargetId(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl">Annuler</button>
                      <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30">Supprimer</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
