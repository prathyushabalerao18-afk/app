const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const categoryBreakdown = document.getElementById("category-breakdown");
const totalSpending = document.getElementById("total-spending");
const topCategory = document.getElementById("top-category");
const entryCount = document.getElementById("entry-count");
const emptyState = document.getElementById("empty-state");
const rowTemplate = document.getElementById("expense-row-template");
const dateInput = document.getElementById("expense-date");

const seedExpenses = [
  {
    id: crypto.randomUUID(),
    expenseName: "Weekly groceries",
    amount: 82.45,
    date: "2026-03-20",
    category: "Food",
    paymentMethod: "Card",
    notes: "Fresh produce and pantry restock",
  },
  {
    id: crypto.randomUUID(),
    expenseName: "Train pass",
    amount: 39.0,
    date: "2026-03-18",
    category: "Transport",
    paymentMethod: "Digital wallet",
    notes: "Monthly commuter pass",
  },
  {
    id: crypto.randomUUID(),
    expenseName: "Streaming subscription",
    amount: 15.99,
    date: "2026-03-17",
    category: "Entertainment",
    paymentMethod: "Card",
    notes: "Family plan renewal",
  },
];

let expenses = [...seedExpenses];

dateInput.value = new Date().toISOString().split("T")[0];

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildCategoryTotals(items) {
  return items.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});
}

function renderSummary() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = buildCategoryTotals(expenses);
  const [leadingCategory = "—"] = Object.entries(categoryTotals)
    .sort((left, right) => right[1] - left[1])
    .map(([category]) => category);

  totalSpending.textContent = currencyFormatter.format(total);
  topCategory.textContent = leadingCategory;
  entryCount.textContent = String(expenses.length);
}

function renderCategoryBreakdown() {
  const totals = buildCategoryTotals(expenses);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  categoryBreakdown.innerHTML = "";

  if (!expenses.length) {
    categoryBreakdown.innerHTML = '<p class="empty-state">Category totals will appear once you add expenses.</p>';
    return;
  }

  Object.entries(totals)
    .sort((left, right) => right[1] - left[1])
    .forEach(([category, amount]) => {
      const share = totalSpent ? (amount / totalSpent) * 100 : 0;
      const card = document.createElement("article");
      card.className = "category-card";
      card.innerHTML = `
        <header>
          <span>${category}</span>
          <span>${currencyFormatter.format(amount)}</span>
        </header>
        <div class="progress-track" aria-hidden="true">
          <div class="progress-bar" style="width: ${share.toFixed(1)}%"></div>
        </div>
        <p>${share.toFixed(1)}% of total spending</p>
      `;
      categoryBreakdown.appendChild(card);
    });
}

function renderExpenses() {
  expenseList.innerHTML = "";
  emptyState.hidden = expenses.length > 0;

  expenses
    .slice()
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .forEach((expense) => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      row.querySelector('[data-cell="name"]').textContent = expense.expenseName;
      row.querySelector('[data-cell="category"]').textContent = expense.category;
      row.querySelector('[data-cell="date"]').textContent = formatDate(expense.date);
      row.querySelector('[data-cell="payment"]').textContent = expense.paymentMethod;
      row.querySelector('[data-cell="amount"]').textContent = currencyFormatter.format(expense.amount);
      row.querySelector(".delete-btn").addEventListener("click", () => {
        expenses = expenses.filter((entry) => entry.id !== expense.id);
        render();
      });
      expenseList.appendChild(row);
    });
}

function render() {
  renderSummary();
  renderCategoryBreakdown();
  renderExpenses();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const expense = {
    id: crypto.randomUUID(),
    expenseName: formData.get("expenseName").toString().trim(),
    amount: Number(formData.get("amount")),
    date: formData.get("date").toString(),
    category: formData.get("category").toString(),
    paymentMethod: formData.get("paymentMethod").toString(),
    notes: formData.get("notes").toString().trim(),
  };

  if (!expense.expenseName || !expense.date || !expense.category || !expense.paymentMethod || expense.amount <= 0) {
    return;
  }

  expenses.unshift(expense);
  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
  render();
});

render();
