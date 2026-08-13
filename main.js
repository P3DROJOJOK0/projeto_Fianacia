// main.js
// Lógica principal da aplicação, em JavaScript moderno (ES6+):
// arrow functions, desestruturação, módulos ESM e tratamento de erros.

import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Referências ---------------------------------------------------------

const transactionsRef = collection(db, 'transacoes');

const form = document.getElementById('transaction-form');
const nomeInput = document.getElementById('nome');
const valorInput = document.getElementById('valor');
const tipoInput = document.getElementById('tipo');
const submitButton = form.querySelector('button[type="submit"]');

const list = document.getElementById('transaction-list');
const summaryEl = document.getElementById('summary');
const loadingEl = document.getElementById('loading-state');
const emptyStateEl = document.getElementById('empty-state');
const toastEl = document.getElementById('toast');

const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const formatarData = (timestamp) => {
  if (!timestamp?.toDate) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp.toDate());
};

// --- Feedback ao usuário ---------------------------------------------------

let toastTimeoutId = null;

/**
 * Exibe uma mensagem temporária (sucesso ou erro) para o usuário.
 */
const mostrarToast = (mensagem, tipo = 'erro') => {
  if (!toastEl) return;

  toastEl.textContent = mensagem;
  toastEl.className = `toast ${tipo} visivel`;

  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    toastEl.classList.remove('visivel');
  }, 4000);
};

// --- Validação --------------------------------------------------------

/**
 * Valida os dados de uma transação antes de enviar ao Firestore.
 * Retorna uma mensagem de erro ou null se estiver tudo certo.
 */
const validarTransacao = ({ nome, valor, tipo }) => {
  if (!nome || nome.trim().length === 0) {
    return 'Informe uma descrição para a transação.';
  }
  if (nome.trim().length > 80) {
    return 'A descrição deve ter no máximo 80 caracteres.';
  }

  const valorNumerico = Number(valor);
  if (!valor || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
    return 'Informe um valor numérico maior que zero.';
  }

  if (tipo !== 'receita' && tipo !== 'despesa') {
    return 'Selecione um tipo válido (receita ou despesa).';
  }

  return null;
};

// --- Persistência (Firestore) ------------------------------------------

/**
 * Salva uma nova transação no Firestore.
 */
const salvarTransacao = async (nome, valor, tipo) => {
  await addDoc(transactionsRef, {
    nome: nome.trim(),
    valor: Number(valor),
    tipo,
    criadoEm: serverTimestamp()
  });
};

/**
 * Exclui uma transação pelo id do documento, após confirmação do usuário.
 */
const excluirTransacao = async (id, nome) => {
  const confirmou = window.confirm(`Excluir a transação "${nome}"?`);
  if (!confirmou) return;

  try {
    await deleteDoc(doc(db, 'transacoes', id));
  } catch (erro) {
    console.error('Erro ao excluir transação:', erro);
    mostrarToast('Não foi possível excluir a transação. Tente novamente.');
  }
};

// --- Regras de negócio (cálculo do resumo) -------------------------------

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

// --- Renderização (DOM) --------------------------------------------------
// Observação: usamos textContent (não innerHTML) para exibir dados vindos
// do usuário/banco, evitando XSS a partir de nomes de transações maliciosos.

const renderizarResumo = ({ receitas, despesas, saldo }) => {
  summaryEl.innerHTML = '';

  const linhas = [
    { rotulo: 'Receitas', valor: receitas, classe: 'positivo' },
    { rotulo: 'Despesas', valor: despesas, classe: 'negativo' },
    { rotulo: 'Saldo', valor: saldo, classe: saldo >= 0 ? 'positivo' : 'negativo' }
  ];

  linhas.forEach(({ rotulo, valor, classe }) => {
    const linha = document.createElement('p');

    const rotuloSpan = document.createElement('span');
    rotuloSpan.textContent = `${rotulo}: `;

    const valorForte = document.createElement('strong');
    valorForte.className = classe;
    valorForte.textContent = formatarMoeda(valor);

    linha.append(rotuloSpan, valorForte);
    summaryEl.appendChild(linha);
  });
};

const criarItemTransacao = ({ id, nome, valor, tipo, criadoEm }) => {
  const item = document.createElement('li');
  item.className = `transaction-item ${tipo}`;
  item.dataset.id = id;

  const info = document.createElement('div');
  info.className = 'transaction-info';

  const nomeEl = document.createElement('span');
  nomeEl.className = 'transaction-nome';
  nomeEl.textContent = nome;

  const detalheEl = document.createElement('span');
  detalheEl.className = 'transaction-detalhe';
  const dataFormatada = formatarData(criadoEm);
  detalheEl.textContent = dataFormatada
    ? `${tipo === 'receita' ? '+' : '-'} ${formatarMoeda(valor)} · ${dataFormatada}`
    : `${tipo === 'receita' ? '+' : '-'} ${formatarMoeda(valor)}`;

  info.append(nomeEl, detalheEl);

  const excluirBtn = document.createElement('button');
  excluirBtn.type = 'button';
  excluirBtn.className = 'btn-excluir';
  excluirBtn.setAttribute('aria-label', `Excluir transação ${nome}`);
  excluirBtn.textContent = '✕';
  excluirBtn.addEventListener('click', () => excluirTransacao(id, nome));

  item.append(info, excluirBtn);
  return item;
};

const renderizarLista = (transacoes) => {
  list.innerHTML = '';

  const temTransacoes = transacoes.length > 0;
  emptyStateEl.hidden = temTransacoes;
  list.hidden = !temTransacoes;

  transacoes.forEach((transacao) => {
    list.appendChild(criarItemTransacao(transacao));
  });
};

// --- Sincronização em tempo real ------------------------------------------

/**
 * Escuta as transações em tempo real usando onSnapshot e atualiza a UI.
 */
const escutarTransacoes = () => {
  const transacoesQuery = query(transactionsRef, orderBy('criadoEm', 'desc'));

  onSnapshot(
    transacoesQuery,
    (snapshot) => {
      loadingEl.hidden = true;

      const transacoes = snapshot.docs.map((documento) => {
        const { nome, valor, tipo, criadoEm } = documento.data();
        return { id: documento.id, nome, valor, tipo, criadoEm };
      });

      renderizarLista(transacoes);
      renderizarResumo(calcularResumo(transacoes));
    },
    (erro) => {
      loadingEl.hidden = true;
      console.error('Erro ao escutar transações:', erro);
      mostrarToast('Não foi possível carregar as transações. Verifique sua conexão.');
    }
  );
};

// --- Formulário -----------------------------------------------------------

const tratarEnvioFormulario = async (evento) => {
  evento.preventDefault();

  const { nome, valor, tipo } = Object.fromEntries(new FormData(form));
  const erroValidacao = validarTransacao({ nome, valor, tipo });

  if (erroValidacao) {
    mostrarToast(erroValidacao);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Salvando...';

  try {
    await salvarTransacao(nome, valor, tipo);
    form.reset();
    nomeInput.focus();
  } catch (erro) {
    console.error('Erro ao salvar transação:', erro);
    mostrarToast('Não foi possível salvar a transação. Tente novamente.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Salvar Transação';
  }
};

// --- Inicialização ----------------------------------------------------

const iniciar = () => {
  form.addEventListener('submit', tratarEnvioFormulario);
  escutarTransacoes();
};

iniciar();