
import { DocumentData, RejectedCheck, AvisData } from '../types';

const DB_NAME = 'SupersecDB';
const STORE_DOCS = 'documents';
const STORE_CHECKS = 'rejected_checks';
const STORE_AVIS = 'avis_incidents';
const DB_VERSION = 3;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        const store = db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
        store.createIndex('created_at', 'created_at', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CHECKS)) {
        const checkStore = db.createObjectStore(STORE_CHECKS, { keyPath: 'id' });
        checkStore.createIndex('created_at', 'created_at', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_AVIS)) {
        const avisStore = db.createObjectStore(STORE_AVIS, { keyPath: 'id' });
        avisStore.createIndex('created_at', 'created_at', { unique: false });
      }
    };
  });
};

export const getAllData = async (): Promise<{ documents: DocumentData[], checks: RejectedCheck[], avis: AvisData[] }> => {
  const docs = await getAllDocuments();
  const checks = await getAllChecks();
  const avis = await getAllAvis();
  return { documents: docs, checks, avis };
};

// Documents
export const saveDocument = async (doc: DocumentData): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction([STORE_DOCS], 'readwrite');
  tx.objectStore(STORE_DOCS).put(doc);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};
export const getAllDocuments = async (): Promise<DocumentData[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const request = db.transaction([STORE_DOCS], 'readonly').objectStore(STORE_DOCS).getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.created_at - a.created_at));
  });
};
export const deleteDocument = async (id: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction([STORE_DOCS], 'readwrite');
  tx.objectStore(STORE_DOCS).delete(id);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

// Checks
export const saveCheck = async (check: RejectedCheck): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction([STORE_CHECKS], 'readwrite');
  tx.objectStore(STORE_CHECKS).put(check);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};
export const getAllChecks = async (): Promise<RejectedCheck[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const request = db.transaction([STORE_CHECKS], 'readonly').objectStore(STORE_CHECKS).getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.created_at - a.created_at));
  });
};
export const deleteCheck = async (id: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction([STORE_CHECKS], 'readwrite');
  tx.objectStore(STORE_CHECKS).delete(id);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

// Avis (Incidents)
export const saveAvis = async (avis: AvisData): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction([STORE_AVIS], 'readwrite');
  tx.objectStore(STORE_AVIS).put(avis);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};
export const getAllAvis = async (): Promise<AvisData[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const request = db.transaction([STORE_AVIS], 'readonly').objectStore(STORE_AVIS).getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.created_at - a.created_at));
  });
};
export const deleteAvis = async (id: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction([STORE_AVIS], 'readwrite');
  tx.objectStore(STORE_AVIS).delete(id);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

export const restoreBackup = async (backupData: any): Promise<number> => {
    if (!backupData || typeof backupData !== 'object') {
        throw new Error("Données de sauvegarde invalides.");
    }
    const db = await initDB();
    return new Promise((resolve, reject) => {
      // On s'assure que les objectStores existent avant de démarrer la transaction
      const transaction = db.transaction([STORE_DOCS, STORE_CHECKS, STORE_AVIS], 'readwrite');
      let count = 0;
      
      try {
        if (backupData.documents && Array.isArray(backupData.documents)) {
          backupData.documents.forEach((i: any) => { transaction.objectStore(STORE_DOCS).put(i); count++; });
        }
        if (backupData.checks && Array.isArray(backupData.checks)) {
          backupData.checks.forEach((i: any) => { transaction.objectStore(STORE_CHECKS).put(i); count++; });
        }
        if (backupData.avis && Array.isArray(backupData.avis)) {
          backupData.avis.forEach((i: any) => { transaction.objectStore(STORE_AVIS).put(i); count++; });
        }
        
        // Compatibilité avec d'anciens formats d'exportation
        if (backupData.checks_rejetes && Array.isArray(backupData.checks_rejetes)) {
           backupData.checks_rejetes.forEach((i: any) => { transaction.objectStore(STORE_CHECKS).put(i); count++; });
        }
      } catch (e) {
        transaction.abort();
        reject(new Error("Format de données corrompu ou incompatible."));
        return;
      }

      transaction.oncomplete = () => resolve(count);
      transaction.onerror = () => reject(transaction.error);
    });
};
