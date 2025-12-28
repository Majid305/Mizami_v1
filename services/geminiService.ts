import { GoogleGenAI, Type } from "@google/genai";
import { DocumentData, RejectedCheck, AvisData } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.warn("Gemini API Key is missing. Please check your environment variables or GitHub Secrets.");
  }
  return key || "";
};

const documentSchema = {
  type: Type.OBJECT,
  properties: {
    langue_document: { type: Type.STRING },
    type_objet: { type: Type.STRING },
    date_document: { type: Type.STRING },
    objet: { type: Type.STRING },
    emetteur: { type: Type.STRING },
    destinataire: { type: Type.STRING },
    reference: { type: Type.STRING },
    resume: { type: Type.STRING },
    suite_a_reserver: { type: Type.STRING },
    observation: { type: Type.STRING },
    autres_infos: { type: Type.STRING }
  },
  required: ["langue_document", "type_objet", "objet", "resume"]
};

const checkSchema = {
  type: Type.OBJECT,
  properties: {
    banque: { type: Type.STRING },
    numero_cheque: { type: Type.STRING },
    numero_compte: { type: Type.STRING },
    rib: { type: Type.STRING },
    montant: { type: Type.NUMBER },
    date_rejet: { type: Type.STRING },
    motif_rejet: { type: Type.STRING },
    classe_rejet: { type: Type.STRING },
    ville: { type: Type.STRING },
    nom_proprietaire: { type: Type.STRING },
    nom_beneficiaire: { type: Type.STRING }
  },
  required: ["banque", "numero_cheque", "montant"]
};

const avisSchema = {
  type: Type.OBJECT,
  properties: {
    victime_objet: { type: Type.STRING, description: "Nom de la victime ou désignation de l'objet du sinistre" },
    description_sinistre: { type: Type.STRING, description: "Récit complet et détaillé de l'incident" },
    lieu_date_heure: { type: Type.STRING, description: "Localisation précise, date et heure du sinistre" },
    dommages: { type: Type.STRING, description: "Inventaire des dégâts matériels ou corporels" },
    causes_circonstances: { type: Type.STRING, description: "Analyse des causes directes et indirectes" },
    responsabilites: { type: Type.STRING, description: "Identification des parties présumées responsables" },
    mesures_prises: { type: Type.STRING, description: "Actions correctives ou de secours immédiates" },
    nature_incident: { type: Type.STRING, description: "Catégorie: Incendie, Vol, Panne Technique, Accident ou Autre" },
    observations: { type: Type.STRING, description: "Remarques complémentaires du constat" },
    date_iso: { type: Type.STRING, description: "Date au format YYYY-MM-DD" },
    rapport_introduction: { type: Type.STRING, description: "Texte formel d'introduction pour un rapport d'audit institutionnel" },
    rapport_analyse_technique: { type: Type.STRING, description: "Analyse experte et technique approfondie des défaillances constatées" },
    rapport_conclusion: { type: Type.STRING, description: "Conclusion synthétique et recommandations stratégiques" }
  },
  required: ["victime_objet", "description_sinistre", "nature_incident", "rapport_conclusion", "causes_circonstances"]
};

export const analyzeDocument = async (base64Image: string, mimeType: string): Promise<Partial<DocumentData>> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts: [{ text: "Analyse ce document administratif." }, { inlineData: { data: base64Image.split(',')[1], mimeType } }] },
    config: { responseMimeType: "application/json", responseSchema: documentSchema }
  });
  return JSON.parse(response.text || "{}");
};

export const generateResponseDraft = async (doc: Partial<DocumentData>, instructions: string): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `En tant qu'assistant administratif expert, rédige un brouillon de réponse professionnelle ou une note d'action détaillée pour le document suivant :
  Objet : ${doc.objet}
  Émetteur : ${doc.emetteur}
  Résumé : ${doc.resume}
  Action Suggérée initialement : ${doc.suite_a_reserver}
  
  Instructions spécifiques de l'utilisateur pour cette réponse : ${instructions}
  
  Le texte doit être prêt à l'emploi, poli et bien structuré.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt
  });
  return response.text || "";
};

export const analyzeCheck = async (base64Image: string, mimeType: string): Promise<Partial<RejectedCheck>> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts: [{ text: "Analyse ce chèque bancaire." }, { inlineData: { data: base64Image.split(',')[1], mimeType } }] },
    config: { responseMimeType: "application/json", responseSchema: checkSchema }
  });
  return JSON.parse(response.text || "{}");
};

export const analyzeIncident = async (base64Image: string | null, mimeType: string, text?: string): Promise<Partial<AvisData>> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [{ text: "Analyse cet incident et génère une expertise complète incluant un Rapport d'Enquête structuré. Sois extrêmement professionnel, technique et précis sur l'analyse technique des causes. Remplis tous les champs du schéma JSON." }];
  if (base64Image) parts.push({ inlineData: { data: base64Image.split(',')[1], mimeType } });
  if (text) parts.push({ text: `Notes de l'expert terrain: ${text}` });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts },
    config: { responseMimeType: "application/json", responseSchema: avisSchema }
  });
  return JSON.parse(response.text || "{}");
};

export const generateReportSynthesis = async (documents: DocumentData[], period: string, type: string): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const docSummaries = documents.map(d => `- ${d.date_document}: ${d.objet} (${d.type_objet}). Résumé: ${d.resume}`).join('\n');
  
  const prompt = `Génère une synthèse professionnelle pour un rapport d'audit administratif.
  Période: ${period}
  Type de documents: ${type}
  Nombre de documents traités: ${documents.length}
  
  Données:
  ${docSummaries}
  
  Le rapport doit être structuré avec des sections numérotées (ex: 1. Introduction, 2. Analyse des flux, 3. Points de vigilance, 4. Conclusion).
  Utilise un ton formel et expert.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt
  });
  return response.text || "Erreur de génération du rapport.";
};