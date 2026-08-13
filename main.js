// main.js
// Lógica principal da aplicação, em JavaScript moderno (ES6+):
// arrow functions, desestruturação e módulos (import/export).

import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Referência para a coleção "transacoes" no Firestore
const transactionsRef = collection(db, 'transacoes');

// Elementos do DOM
const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const summaryEl = document.getElementById('summary');

/**
 * Salva uma nova transação no Firestore.
 */
const salvarTransacao = async (nome, valor, tipo) => {
  try {
    await addDoc(transactionsRef, {
      nome,
      valor: Number(valor),
      tipo,
      criadoEm: new Date()
    });
  } catch (erro) {
    console.error('Erro ao salvar transação:', erro);
  }
};

/**
 * Filtra as transações por tipo e calcula receitas, despesas e saldo.
 */
const calcularResumo = (transacoes) => {
  const receitas = transacoes
    .filter(({ tipo }) => tipo === 'receita')
    .reduce((total, { valor }) => total + valor, 0);

  const despesas = transacoes
    .filter(({ tipo }) => tipo === 'despesa')
    .reduce((total, { valor }) => total + valor, 0);

  const saldo = receitas - despesas;

  return { receitas, despesas, saldo };
};

/**
 * Renderiza o resumo (receitas, despesas e saldo) na tela.
 */
const renderizarResumo = ({ receitas, despesas, saldo }) => {
  summaryEl.innerHTML = `
    <p>Receitas: <strong>R$ ${receitas.toFixed(2)}</strong></p>
    <p>Despesas: <strong>R$ ${despesas.toFixed(2)}</strong></p>
    <p class="${saldo >= 0 ? 'positivo' : 'negativo'}">
      Saldo: <strong>R$ ${saldo.toFixed(2)}</strong>
    </p>
  `;
};

/**
 * Renderiza a lista de transações na tela.
 */
const renderizarLista = (transacoes) => {
  list.innerHTML = '';

  transacoes.forEach(({ id, nome, valor, tipo }) => {
    const item = document.createElement('li');
    item.className = `transaction-item ${tipo}`;
    item.textContent = `${nome} — R$ ${valor.toFixed(2)} (${tipo})`;
    item.dataset.id = id;
    list.appendChild(item);
  });
};

/**
 * Escuta as transações em tempo real usando onSnapshot.
 */
const escutarTransacoes = () => {
  const transacoesQuery = query(transactionsRef, orderBy('criadoEm', 'desc'));

  onSnapshot(transacoesQuery, (snapshot) => {
    const transacoes = snapshot.docs.map((doc) => {
      const { nome, valor, tipo } = doc.data();
      return { id: doc.id, nome, valor, tipo };
    });

    renderizarLista(transacoes);
    renderizarResumo(calcularResumo(transacoes));
  }, (erro) => {
    console.error('Erro ao escutar transações:', erro);
  });
};

/**
 * Trata o envio do formulário.
 */
const tratarEnvioFormulario = (evento) => {
  evento.preventDefault();

  const { nome, valor, tipo } = Object.fromEntries(new FormData(form));

  if (!nome || !valor) return;

  salvarTransacao(nome, valor, tipo);
  form.reset();
};

form.addEventListener('submit', tratarEnvioFormulario);

escutarTransacoes();