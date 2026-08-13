# Prompt IA — Framework COSTAR

Prompt utilizado para solicitar a uma IA generativa a criação da lógica
matemática do "Resumo de Gastos" (soma de receitas vs. despesas e saldo final).

---

**C — Context (Contexto):**
Estou desenvolvendo uma aplicação web de controle financeiro pessoal,
construída com HTML, CSS e JavaScript puro (ES6+, módulos ESM), sem
frameworks front-end. Os dados das transações são armazenados no Firebase
Firestore e recuperados em tempo real via `onSnapshot`. Cada transação é um
objeto com o formato `{ id, nome, valor, tipo }`, onde `tipo` pode ser
`"receita"` ou `"despesa"`.

**O — Objective (Objetivo):**
Crie uma função em JavaScript, no padrão arrow function, chamada
`calcularResumo`, que receba um array de transações e:
1. Filtre as transações do tipo `"receita"` e some seus valores;
2. Filtre as transações do tipo `"despesa"` e some seus valores;
3. Calcule o saldo final (receitas − despesas);
4. Retorne um objeto `{ receitas, despesas, saldo }` utilizando
   desestruturação sempre que possível.

**S — Style (Estilo):**
Código limpo, enxuto e idiomático em JavaScript moderno (ES6+). Utilize
apenas recursos nativos da linguagem (`filter`, `reduce`, arrow functions,
desestruturação de objetos). Não utilize bibliotecas ou dependências
externas.

**T — Tone (Tom):**
Técnico e direto, sem explicações desnecessárias — apenas o código e, se
necessário, comentários curtos explicando cada etapa do cálculo.

**A — Audience (Público):**
Desenvolvedores front-end com conhecimento intermediário em JavaScript,
que irão integrar essa função diretamente ao módulo `main.js` do projeto.

**R — Response (Formato da Resposta):**
Retornar apenas um bloco de código JavaScript contendo a função
`calcularResumo`, pronta para ser importada/exportada como módulo ES6,
sem texto adicional fora do bloco de código.