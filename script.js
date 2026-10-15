// ===== Day 2: variables (let/const), data types, global scope =====
let budget = 3000;
let nextId = 4;
let activeCat = "all";
const CATS = ["food", "travel", "study", "other"];

// ===== Day 9: array of objects (array ke andar objects, object ke andar array) =====
let expenses = [
  { id: 1, title: "chai aur samosa", amount: 40, category: "food", tags: ["college", "snack"] },
  { id: 2, title: "Dehradun bus pass", amount: 600, category: "travel", tags: ["monthly"] },
  { id: 3, title: "JS course notes", amount: 250, category: "study", tags: ["college", "coding"] }
];

const $ = id => document.getElementById(id); // DOM selector shortcut

// ===== Day 5: switch statement (discrete choices) =====
function icon(cat) {
  switch (cat) {
    case "food": return "🍜";
    case "travel": return "🚌";
    case "study": return "📚";
    default: return "🎯";
  }
}

// ===== Day 3: string methods =====
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
function shorten(s) { return s.length > 24 ? s.substring(0, 24).concat("…") : s; }
function esc(s) { return s.replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }

// ===== Day 7: default parameter + return =====
function fmt(n, symbol = "₹") { return `${symbol}${n}`; }

// ===== Day 6: for loop =====
function total(list) {
  let t = 0;
  for (let i = 0; i < list.length; i++) { t += list[i].amount; } // Day 4: compound assignment
  return t;
}

// ===== Day 5: else-if ladder (order matters) =====
function budgetStatus(pct) {
  if (pct >= 100) return ["Budget khatam! Ab bachat mode.", "var(--bad)"];
  else if (pct >= 75) return ["Dhyan se, 75% se zyada ho gaya.", "var(--hl)"];
  else if (pct >= 40) return ["Theek chal raha hai.", "var(--ac)"];
  else return ["Badhiya, kharcha control mein hai.", "var(--ok)"];
}

// ===== Day 8: events + DOM + value/innerHTML =====
function addExpense() {
  const title = $("title").value.trim();
  const amount = Number($("amount").value); // Day 4: type conversion
  const category = $("category").value;
  // Day 5: falsy values (""  0  NaN) check
  if (!title || !amount || amount <= 0) {
    alert("Title likho aur amount 0 se zyada daalo.");
    return;
  }
  const tags = $("tags").value.split(",").map(t => t.trim().toLowerCase()).filter(t => t); // map + filter
  expenses.unshift({ id: nextId++, title, amount, category, tags }); // unshift + postfix ++
  $("title").value = ""; $("amount").value = ""; $("tags").value = "";
  console.log("Added:", title, typeof amount);
  render();
}
function undoLast() { expenses.shift(); render(); }        // shift: start se hatao
function removeOldest() { expenses.pop(); render(); }      // pop: end se hatao
function removeItem(id) { expenses = expenses.filter(e => e.id !== id); render(); }

function setCat(cat) { activeCat = cat; render(); }

// ===== Day 4 + 6: prompt() + do-while + break =====
function setBudget() {
  let n;
  do {
    const input = prompt("Naya monthly budget (₹) daalo:", budget);
    if (input === null) return; // cancel dabaya to loop se bahar
    n = Number(input);
  } while (isNaN(n) || n <= 0);
  budget = n;
  render();
}

// ===== Render: sab kuch yahin judta hai =====
function render() {
  const q = $("search").value.trim().toLowerCase();

  // Day 9: filter() -- category + search (includes / startsWith / replace)
  let list = expenses.filter(e => activeCat === "all" || e.category === activeCat);
  if (Boolean(q)) {
    list = list.filter(e => q.startsWith("#") ? e.tags.includes(q.replace("#", "")) : e.title.toLowerCase().includes(q));
  }

  // list: for loop + Day 4 modulus (%) se alternate rows
  let html = "";
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    const tagText = e.tags.length ? "#" + e.tags.join(" #") : "no tags";
    html += `<li class="${i % 2 === 0 ? "even" : "odd"}"><span>${icon(e.category)} ${esc(capitalize(shorten(e.title)))}<small>${esc(tagText)}</small></span><span><b>${fmt(e.amount)}</b> <button aria-label="Hatao" onclick="removeItem(${e.id})">✕</button></span></li>`;
  }
  $("list").innerHTML = html || "<li>Kuch nahi mila. Upar se kharcha jodo.</li>";

  // chips highlight: querySelectorAll + forEach + style
  document.querySelectorAll(".chip").forEach(b => {
    b.classList.toggle("on", b.dataset.cat === activeCat);
    b.style.fontWeight = b.dataset.cat === activeCat ? "800" : "400";
  });

  // stats
  const spent = total(expenses);
  const pct = Math.round(spent / budget * 100);
  const [msg, color] = budgetStatus(pct);
  $("spent").innerHTML = `${fmt(spent)} <small style="font-size:1rem;color:var(--mut)">/ ${fmt(budget)}</small>`;
  $("status").innerHTML = `${pct}% use hua. ${msg}`;
  $("status").style.color = color;
  $("fill").style.width = Math.min(pct, 100) + "%";
  $("fill").style.background = color;

  const avg = expenses.length ? Math.round(spent / expenses.length) : 0;
  const amounts = expenses.map(e => e.amount);
  $("avg").innerHTML = fmt(avg);
  $("max").innerHTML = amounts.length ? fmt(Math.max(...amounts)) : "-";

  // Day 6: while loop -- is average se budget kitne din / kharche chalega
  let left = budget - spent, count = 0;
  while (avg > 0 && left >= avg) { left -= avg; count++; }
  $("days").innerHTML = count + " aur";

  // Day 4: ** (power) -- budget 6% pe 5 saal invest ho to
  $("invest").innerHTML = `Tip: ${fmt(budget)} ko 6% pe 5 saal invest karo to ${fmt(Math.round(budget * (1 + 6 / 100) ** 5))} banenge.`;

  // Day 6: nested loop + continue -- star chart
  let chart = "";
  for (const c of CATS) {
    const sum = total(expenses.filter(e => e.category === c));
    if (sum === 0) continue; // khali category skip
    const n = Math.min(20, Math.ceil(sum / budget * 20));
    let stars = "";
    for (let j = 0; j < n; j++) { stars += "★"; }
    chart += `<p style="margin:6px 0">${icon(c)} <b>${capitalize(c)}</b> ${fmt(sum)}<br><span class="st">${stars}</span></p>`;
  }
  $("chart").innerHTML = chart || "<p class='note'>Pehle kuch kharcha jodo.</p>";

  // Day 6: break -- pehla bada kharcha (500+) milte hi loop band
  let big = null;
  for (let k = 0; k < expenses.length; k++) {
    if (expenses[k].amount > 500) { big = expenses[k]; break; }
  }
  $("first").innerHTML = big ? `Sabse upar ka bada kharcha: ${esc(big.title)} (${fmt(big.amount)})` : "Abhi koi 500+ ka kharcha nahi hai.";
}

render();
