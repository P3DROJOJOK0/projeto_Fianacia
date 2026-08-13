// firebase-config.js
// Importa e inicializa o Firebase via CDN (ESM) — sem necessidade de npm/node.
//
// ⚠️ Substitua os valores abaixo pelas credenciais do SEU projeto:
// Console do Firebase > Configurações do Projeto > Seus apps > SDK config.
//
// ⚠️ Segurança: a apiKey do Firebase não é secreta (ela só identifica o
// projeto), mas quem protege seus dados são as Regras de Segurança do
// Firestore. Nunca deixe o banco em modo "teste" (aberto) em produção —
// veja o exemplo de regras no README.md.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5P2HnQWSevl4FmuFO55NdjJXYQwRkpxE",
  authDomain: "projetoautomacaologica.firebaseapp.com",
  projectId: "projetoautomacaologica",
  storageBucket: "projetoautomacaologica.firebasestorage.app",
  messagingSenderId: "694174264244",
  appId: "1:694174264244:web:2fb31411b5be34359de0e1",
  measurementId: "G-SB50PYKEDR"
};

// Inicializa o app do Firebase
const app = initializeApp(firebaseConfig);

// Instância do Firestore, usada pelos outros módulos
export const db = getFirestore(app);

// Habilita cache offline (opcional): permite que a lista de transações
// continue visível mesmo sem conexão, sincronizando ao reconectar.
// Falha silenciosamente em abas múltiplas ou navegadores sem suporte,
// então tratamos o erro sem quebrar a aplicação.
try {
  await enableIndexedDbPersistence(db);
} catch (erro) {
  if (erro.code === 'failed-precondition') {
    console.warn('Persistência offline desativada: múltiplas abas abertas.');
  } else if (erro.code === 'unimplemented') {
    console.warn('Persistência offline não suportada neste navegador.');
  } else {
    console.warn('Não foi possível habilitar a persistência offline:', erro);
  }
}