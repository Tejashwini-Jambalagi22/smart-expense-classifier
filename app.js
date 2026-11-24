let token = localStorage.getItem("token"); 

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

async function addExpense() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  if (!desc || !amount) return alert("Enter description and amount");

  let category = "Other";
  const categories = ["Pizza","Groceries","Bus","Train","Recharge","Electricity bill","Movie","Coffee"];
  for (let c of categories) {
    if (desc.toLowerCase().includes(c.toLowerCase())) {
      category = c;
      break;
    }
  }

  const res = await fetch("http://127.0.0.1:8000/expenses", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ description: desc, amount, category })
  });

  if (res.ok) {
    document.getElementById("desc").value = "";
    document.getElementById("amount").value = "";
    loadData();
  } else alert("Failed to add expense");
}

async function deleteExpense(id) {
  const res = await fetch(`http://127.0.0.1:8000/expenses/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (res.ok) loadData();
  else alert("Failed to delete expense");
}

async function editExpense(id, oldDesc, oldAmount) {
  const newDesc = prompt("Update description", oldDesc);
  const newAmount = parseFloat(prompt("Update amount", oldAmount));
  if (!newDesc || !newAmount) return;

  let category = "Other";
  const categories = ["Pizza","Groceries","Bus","Train","Recharge","Electricity bill","Movie","Coffee"];
  for (let c of categories) {
    if (newDesc.toLowerCase().includes(c.toLowerCase())) {
      category = c;
      break;
    }
  }

  const res = await fetch(`http://127.0.0.1:8000/expenses/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ description: newDesc, amount: newAmount, category })
  });

  if (res.ok) loadData();
  else alert("Failed to edit expense");
}

async function loadData() {
  const res = await fetch("http://127.0.0.1:8000/summary", { headers: getHeaders() });
  if (!res.ok) return alert("Failed to fetch summary");

  const summary = await res.json();
  document.getElementById("total").innerText = `₹${summary.total.toFixed(2)}`;
  document.getElementById("count").innerText = summary.count;

  const ctx = document.getElementById("chart").getContext("2d");
  if (window.barChart) window.barChart.destroy();
  window.barChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(summary.categories),
      datasets: [{
        data: Object.values(summary.categories),
        backgroundColor: ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#C9CBCF","#FF6B6B"]
      }]
    }
  });

  const res2 = await fetch("http://127.0.0.1:8000/expenses", { headers: getHeaders() });
  const expenses = await res2.json();

  const daily = {};
  expenses.forEach(e => {
    const date = new Date(e.date).toISOString().split("T")[0];
    daily[date] = (daily[date] || 0) + e.amount;
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  if (window.lineChart) window.lineChart.destroy();
  window.lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: Object.keys(daily),
      datasets: [{
        label: "Daily Spending",
        data: Object.values(daily),
        borderColor: "#36A2EB",
        fill: false
      }]
    }
  });


  const tbody = document.querySelector("#transactions tbody");
  tbody.innerHTML = "";
  expenses.sort((a,b)=> new Date(b.date) - new Date(a.date)).forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.description}</td>
      <td>${e.category}</td>
      <td class="desktop-only">${new Date(e.date).toLocaleDateString()}</td>
      <td>₹${e.amount.toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editExpense(${e.id}, '${e.description}', ${e.amount})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${e.id})">❌</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

if (!token) window.location.href = "login.html";
loadData();
