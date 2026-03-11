const questions = [
  {
    category: "Rent Collection Workflow",
    prompt:
      "Can you walk me through your current end-to-end process for collecting rent each month, from due date setup to confirming payment?"
  },
  {
    category: "Payment Channels",
    prompt:
      "What payment methods do your tenants usually use (cash, GCash, bank transfer, etc.), and why do you think they prefer those methods?"
  },
  {
    category: "Record Keeping",
    prompt:
      "How do you currently record payments (notebook, spreadsheet, chat logs), and what exact details do you capture per payment?"
  },
  {
    category: "Monitoring",
    prompt:
      "How do you monitor who has paid and who has not, especially when the due date is near or already past due?"
  },
  {
    category: "Pain Points",
    prompt:
      "What becomes difficult in your current system when the number of tenants increases?"
  },
  {
    category: "Payment Disputes",
    prompt:
      "How do you handle situations where a tenant says they already paid but your records do not show it?"
  },
  {
    category: "Evidence and Validation",
    prompt:
      "What proof do you usually request for online payments, and how do you verify that proof?"
  },
  {
    category: "Trust in Automation",
    prompt:
      "If you use an automated payment tracking system, what features must it have before you can fully trust it?"
  },
  {
    category: "Usability",
    prompt:
      "How simple should the app interface be for landlords who are not very tech-savvy?"
  },
  {
    category: "Maintenance Process",
    prompt:
      "How do tenants currently report maintenance issues, and what is your step-by-step process after receiving a report?"
  },
  {
    category: "Repair Responsibility",
    prompt:
      "How do you decide whether the landlord or tenant should pay for a repair?"
  },
  {
    category: "Prioritization",
    prompt:
      "What criteria do you use to prioritize maintenance requests (urgent, moderate, minor)?"
  },
  {
    category: "Batch Repairs",
    prompt:
      "For minor issues, do you schedule them in batches, and how often do you run those scheduled maintenance rounds?"
  },
  {
    category: "Availability",
    prompt:
      "What communication problems happen when you are away from the property, and how do tenants reach you?"
  },
  {
    category: "Document Security",
    prompt:
      "How do you store and secure legal documents such as contracts, permits, and property records?"
  },
  {
    category: "Legal Compliance",
    prompt:
      "What permits and legal requirements are essential for operating your apartment rental business?"
  },
  {
    category: "Time Management",
    prompt:
      "Which management tasks consume most of your time each week, and why?"
  },
  {
    category: "Move-out / Turnover",
    prompt:
      "What is your complete turnover process when one tenant moves out and a new one moves in?"
  },
  {
    category: "Advance and Deposit",
    prompt:
      "How do you explain and manage the 1-month advance and 1-month deposit policy with tenants?"
  },
  {
    category: "Team Setup",
    prompt:
      "Do you manage the property alone, with family, or with hired staff? How does this affect operations?"
  },
  {
    category: "Marketing",
    prompt:
      "Where and how do you market vacant units, and which channels are most effective?"
  },
  {
    category: "Tenant Screening",
    prompt:
      "What documents and criteria do you require before approving a potential tenant?"
  },
  {
    category: "Occupancy Rules",
    prompt:
      "What occupancy limits do you enforce per unit type, and how do you communicate these rules?"
  },
  {
    category: "Contract and Billing",
    prompt:
      "What are your contract terms (duration, renewals), and how do you compute and explain utility charges transparently?"
  },
  {
    category: "Outstanding Balances",
    prompt:
      "What is your policy when a tenant wants to move out but still has unpaid rent or utility bills?"
  }
];

const responseEl = document.getElementById("response");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const categoryTag = document.getElementById("categoryTag");
const questionPrompt = document.getElementById("questionPrompt");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const summarySection = document.getElementById("summary");
const summaryList = document.getElementById("summaryList");
const restartBtn = document.getElementById("restartBtn");
const surveyCard = document.querySelector(".survey-card");

let currentIndex = 0;
const answers = Array(questions.length).fill("");

function renderQuestion() {
  const item = questions[currentIndex];
  categoryTag.textContent = item.category;
  questionPrompt.textContent = item.prompt;
  responseEl.value = answers[currentIndex];

  progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

  prevBtn.disabled = currentIndex === 0;
  prevBtn.style.opacity = currentIndex === 0 ? "0.55" : "1";
  nextBtn.textContent = currentIndex === questions.length - 1 ? "Finish" : "Next";
}

function saveCurrentAnswer() {
  answers[currentIndex] = responseEl.value.trim();
}

function renderSummary() {
  summaryList.innerHTML = "";
  questions.forEach((q, index) => {
    const card = document.createElement("article");
    card.className = "summary-item";

    const heading = document.createElement("h3");
    heading.textContent = `${index + 1}. ${q.prompt}`;

    const answer = document.createElement("p");
    answer.textContent = answers[index] || "(No response provided)";

    card.append(heading, answer);
    summaryList.appendChild(card);
  });
}

prevBtn.addEventListener("click", () => {
  saveCurrentAnswer();
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  saveCurrentAnswer();
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    return;
  }

  renderSummary();
  surveyCard.classList.add("hidden");
  summarySection.classList.remove("hidden");
});

restartBtn.addEventListener("click", () => {
  answers.fill("");
  currentIndex = 0;
  summarySection.classList.add("hidden");
  surveyCard.classList.remove("hidden");
  renderQuestion();
});

renderQuestion();
