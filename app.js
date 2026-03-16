let transactions = JSON.parse(localStorage.getItem('expense_tracker')) || [];

const descInput = document.getElementById('descInput');
const amountInput = document.getElementById('amountInput');
const typeSelect = document.getElementById('typeSelect');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const transactionList = document.getElementById('transactionList');
const emptyMsg = document.getElementById('emptyMsg');
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');

function save() {
  localStorage.setItem('expense_tracker', JSON.stringify(transactions));
}

function fmt(num) {
  return '$' + Math.abs(num).toFixed(2);
}

function updateSummary() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  totalIncomeEl.textContent = fmt(income);
  totalExpenseEl.textContent = fmt(expense);
  balanceEl.textContent = (balance >= 0 ? '+' : '-') + fmt(balance);
  balanceEl.style.color = balance >= 0 ? '#818cf8' : '#ef4444';
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function render() {
  transactionList.innerHTML = '';
  emptyMsg.style.display = transactions.length === 0 ? 'block' : 'none';

  [...transactions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach(tx => {
      const li = document.createElement('li');
      li.className = `tx-item ${tx.type}`;
      li.innerHTML = `
        <div class="tx-info">
          <div class="tx-desc">${tx.desc}</div>
          <div class="tx-meta">${tx.category} · ${formatDate(tx.createdAt)}</div>
        </div>
        <div class="tx-right">
          <span class="tx-amount">${tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}</span>
          <button class="tx-delete" data-id="${tx.id}" title="Remove">✕</button>
        </div>
      `;
      transactionList.appendChild(li);
    });

  updateSummary();
}

function addTransaction() {
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!desc) { descInput.focus(); return; }
  if (isNaN(amount) || amount <= 0) { amountInput.focus(); return; }

  transactions.push({
    id: Date.now(),
    desc,
    amount,
    type: typeSelect.value,
    category: categorySelect.value,
    createdAt: Date.now()
  });

  save();
  render();

  descInput.value = '';
  amountInput.value = '';
  descInput.focus();
}

transactionList.addEventListener('click', e => {
  const btn = e.target.closest('.tx-delete');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
});

clearAllBtn.addEventListener('click', () => {
  if (transactions.length === 0) return;
  if (!confirm('Clear all transactions?')) return;
  transactions = [];
  save();
  render();
});

addBtn.addEventListener('click', addTransaction);

descInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTransaction(); });
amountInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTransaction(); });

render();
