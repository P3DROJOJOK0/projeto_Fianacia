// firebase-config.js
// Importa o Firebase diretamente via CDN (não é necessário npm/node).
// Atenção: substitua os valores abaixo pelas credenciais do SEU projeto,
// disponíveis em: Console do Firebase > Configurações do Projeto > Seus apps.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

 const firebaseConfig = {
    apiKey: "AIzaSyB5P2HnQWSevl4FmuFO55NdjJXYQwRkpxE",
    authDomain: "projetoautomacaologica.firebaseapp.com",
    projectId: "projetoautomacaologica",
    storageBucket: "projetoautomacaologica.firebasestorage.app",
    messagingSenderId: "694174264244",
    appId: "1:694174264244:web:5f0607af76ede23a9de0e1",
    measurementId: "G-4PX12K997W"
  };

// Inicializa o app do Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância do Firestore para ser usada em outros módulos (main.js)
export const db = getFirestore(app);
