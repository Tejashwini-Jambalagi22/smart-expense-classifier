// ---------------------------
// DASHBOARD.JS
// ---------------------------

// Sample in-memory store for demonstration (replace with API calls later)
let expenses = [];

// ---------------------------
// Categorization Logic
// ---------------------------
function categorize(description) {
  const desc = description.toLowerCase();
  // ----------- Food -----------
  if (desc.includes("pizza") || desc.includes("coffee") || desc.includes("dosa") ||
      desc.includes("burger") || desc.includes("sandwich") || desc.includes("pasta") ||
      desc.includes("rice") || desc.includes("milk") || desc.includes("bread") ||
      desc.includes("fruit") || desc.includes("vegetable") || desc.includes("snack") ||
      desc.includes("breakfast") || desc.includes("lunch") || desc.includes("dinner") ||
      desc.includes("restaurant") || desc.includes("takeaway") || desc.includes("juice") ||
      desc.includes("ice cream") || desc.includes("dessert") || desc.includes("tea")) {
    return "Food";
  }

  // ----------- Entertainment -----------
  if (desc.includes("movie") || desc.includes("concert") || desc.includes("netflix") ||
      desc.includes("spotify") || desc.includes("game") || desc.includes("gaming") ||
      desc.includes("hobby") || desc.includes("amusement park") || desc.includes("bowling") ||
      desc.includes("mini golf") || desc.includes("bar") || desc.includes("pub") ||
      desc.includes("theater") || desc.includes("dancing") || desc.includes("painting")) {
    return "Entertainment";
  }

  // ----------- Transport -----------
  if (desc.includes("bus") || desc.includes("train") || desc.includes("taxi") ||
      desc.includes("flight") || desc.includes("uber") || desc.includes("ola") ||
      desc.includes("metro") || desc.includes("cab") || desc.includes("fuel") ||
      desc.includes("petrol") || desc.includes("parking")) {
    return "Transport";
  }

  // ----------- Groceries -----------
  if (desc.includes("groceries") || desc.includes("milk") || desc.includes("vegetables") ||
      desc.includes("fruits") || desc.includes("bread") || desc.includes("rice") ||
      desc.includes("pulses") || desc.includes("oil") || desc.includes("spices") ||
      desc.includes("snacks") || desc.includes("cereal") || desc.includes("dairy")) {
    return "Groceries";
  }

  // ----------- Bills -----------
  if (desc.includes("electricity") || desc.includes("water") || desc.includes("recharge") ||
      desc.includes("mobile bill") || desc.includes("internet") || desc.includes("gas") ||
      desc.includes("rent") || desc.includes("subscription")) {
    return "Bills";
  }

  // ----------- Other -----------
  return "Other";
}

// ---------------------------
// Add Expense
// ---------------------------
function addExpense() {
  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);

  if (!desc || !amount || amount <= 0) {
    alert("Please enter a valid description and amount");
    return;
  }

  const category = categorize(desc);
  const date = new Date();

  const expense = { description: desc, amount, category, date };
  expenses.push(expense);

  // Clear inputs
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";

  updateDashboard();
}

// ---------------------------
// Delete Expense
// ---------------------------
function deleteExpense(index) {
  expenses.splice(index, 1);
  updateDashboard();
}

// ---------------------------
// Update Dashboard
// ---------------------------
function updateDashboard() {
  updateSummary();
  updateTransactions();
  updateCharts();
  updateInsights();
}

// ---------------------------
// Update Summary Cards
// ---------------------------
function updateSummary() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;
  const avgDaily = total / Math.max(new Set(expenses.map(e => e.date.toDateString())).size, 1);

  document.getElementById("total").innerText = `₹${total.toFixed(2)}`;
  document.getElementById("count").innerText = count;
  document.getElementById("avgDaily").innerText = `₹${avgDaily.toFixed(2)}`;
}

// ---------------------------
// Update Transactions Table
// ---------------------------
function updateTransactions() {
  const tbody = document.getElementById("transactions").querySelector("tbody");
  tbody.innerHTML = "";
  expenses.forEach((e, i) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${e.description}</td>
      <td>${e.category}</td>
      <td>${e.date.toLocaleDateString()}</td>
      <td>₹${e.amount.toFixed(2)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteExpense(${i})">Delete</button></td>
    `;
  });
}

// ---------------------------
// Charts
// ---------------------------
let categoryChart, dailyChart;

function updateCharts() {
  const ctxCategory = document.getElementById("categoryChart").getContext("2d");
  const ctxDaily = document.getElementById("dailyChart").getContext("2d");

  // --- Category Chart ---
  const categoryTotals = {};
  expenses.forEach(e => categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount);
  const categoryLabels = Object.keys(categoryTotals);
  const categoryData = Object.values(categoryTotals);

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(ctxCategory, {
    type: "pie",
    data: {
      labels: categoryLabels,
      datasets: [{
        data: categoryData,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
      }]
    },
    options: { responsive: true }
  });

  // --- Daily Chart ---
  const dailyTotals = {};
  expenses.forEach(e => {
    const dateStr = e.date.toLocaleDateString();
    dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + e.amount;
  });
  const dailyLabels = Object.keys(dailyTotals).sort((a, b) => new Date(a) - new Date(b));
  const dailyData = dailyLabels.map(d => dailyTotals[d]);

  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(ctxDaily, {
    type: "line",
    data: {
      labels: dailyLabels,
      datasets: [{
        label: "Daily Spending",
        data: dailyData,
        fill: false,
        borderColor: "#36A2EB",
        tension: 0.1
      }]
    },
    options: { responsive: true }
  });
}

// ---------------------------
// Insights
// ---------------------------
function updateInsights() {
  const ul = document.getElementById("insights");
  ul.innerHTML = "";

  if (expenses.length === 0) {
    ul.innerHTML = "<li>No expenses yet</li>";
    return;
  }

  const topCategory = Object.entries(expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {})).sort((a,b) => b[1]-a[1])[0];

  ul.innerHTML = `<li>💡 Highest spending category: <strong>${topCategory[0]}</strong> (₹${topCategory[1].toFixed(2)})</li>`;
}

// ---------------------------
// Logout (dummy for now)
// ---------------------------
function logout() {
  alert("Logging out...");
}

// ---------------------------
// Initialize
// ---------------------------
document.addEventListener("DOMContentLoaded", updateDashboard);
