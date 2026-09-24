// ============================================================
//  app.js  –  Frontend JS for Airline Satisfaction Predictor
// ============================================================

// ── Star rating buttons ──────────────────────────────────────
document.querySelectorAll(".star-rating").forEach(group => {
  const field  = group.dataset.field;
  const hidden = document.getElementById(field);
  const btns   = group.querySelectorAll(".star-btn");

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      hidden.value = btn.dataset.val;
    });
  });
});

// ── Animate metric bars on load ──────────────────────────────
const metricMap = [
  ["acc-val",  ".metric-card:nth-child(1) .metric-fill"],
  ["prec-val", ".metric-card:nth-child(2) .metric-fill"],
  ["rec-val",  ".metric-card:nth-child(3) .metric-fill"],
  ["f1-val",   ".metric-card:nth-child(4) .metric-fill"],
];

document.querySelectorAll(".metric-fill").forEach(fill => {
  const target = parseFloat(fill.dataset.target);
  setTimeout(() => { fill.style.width = target + "%"; }, 300);
});

// Animate numbers counting up
function countUp(elId, targetVal, duration = 1400) {
  const el = document.getElementById(elId);
  if (!el) return;
  let start = 0;
  const step = targetVal / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= targetVal) { start = targetVal; clearInterval(timer); }
    el.textContent = start.toFixed(1) + "%";
  }, 16);
}

const cards = document.querySelectorAll(".metric-card");
const ids   = ["acc-val", "prec-val", "rec-val", "f1-val"];
cards.forEach((card, i) => {
  const val = parseFloat(card.dataset.val);
  setTimeout(() => countUp(ids[i], val), 400);
});

// ── Prediction form submit ───────────────────────────────────
const form       = document.getElementById("predict-form");
const btnText    = document.getElementById("btn-text");
const btnLoader  = document.getElementById("btn-loader");
const resultPanel = document.getElementById("result-panel");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Build payload
  const formData  = new FormData(form);
  const payload   = {};
  for (const [key, value] of formData.entries()) {
    payload[key] = value;
  }

  // Show loader
  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");
  resultPanel.classList.add("hidden");

  try {
    const res  = await fetch("/predict", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
      alert("Error: " + data.error);
      return;
    }

    // Display result
    showResult(data);

  } catch (err) {
    alert("Network error: " + err.message);
  } finally {
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
  }
});

function showResult(data) {
  const isSatisfied = data.prediction === "satisfied";

  const icon  = document.getElementById("result-icon");
  const label = document.getElementById("result-label");
  const conf  = document.getElementById("result-confidence");
  const bars  = document.getElementById("prob-bars");

  icon.textContent  = isSatisfied ? "😊" : "😞";
  label.textContent = isSatisfied ? "Satisfied" : "Dissatisfied";
  label.className   = "result-label " + (isSatisfied ? "satisfied" : "dissatisfied");
  conf.textContent  = `Confidence: ${data.confidence}%`;

  // Probability bars
  bars.innerHTML = "";
  for (const [cls, pct] of Object.entries(data.class_probabilities)) {
    const row = document.createElement("div");
    row.className = "prob-row";
    const clsKey = cls.replace(/\s+/g, "-").toLowerCase();
    row.innerHTML = `
      <div class="prob-name">${cls.charAt(0).toUpperCase() + cls.slice(1)}</div>
      <div class="prob-track">
        <div class="prob-fill ${clsKey}" style="width:0%" data-target="${pct}"></div>
      </div>
      <div class="prob-pct">${pct}%</div>
    `;
    bars.appendChild(row);
  }

  // Animate bars
  setTimeout(() => {
    bars.querySelectorAll(".prob-fill").forEach(fill => {
      fill.style.width = fill.dataset.target + "%";
    });
  }, 50);

  resultPanel.classList.remove("hidden");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
