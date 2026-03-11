import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5ST_7iPTK0oeLqhROlCEn8gItAWpaI6c",
  authDomain: "ireside-survey.firebaseapp.com",
  projectId: "ireside-survey",
  storageBucket: "ireside-survey.firebasestorage.app",
  messagingSenderId: "785576727155",
  appId: "1:785576727155:web:a12cd9edf7ad452116d006",
  measurementId: "G-4WKM5NE29D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const questions = [
  {
    category: "Rent Collection",
    prompt: "What is your primary method for collecting rent from boarders each month?",
    type: "multiple",
    options: ["Cash (In-person)", "Bank Transfer (BDO, BPI, etc.)", "E-Wallets (GCash, Maya)", "Digital Portal / App"]
  },
  {
    category: "Payment Channels",
    prompt: "Which payment method do your boarders seem to prefer the most?",
    type: "single",
    options: ["Digital (GCash, Maya, Bank Transfer)", "Physical (Cash)", "They have no strong preference"]
  },
  {
    category: "Record Keeping",
    prompt: "How do you keep track of rent payments and room/bed assignments?",
    type: "multiple",
    options: ["Physical Notebook / Paper", "Spreadsheets (Excel, Google Sheets)", "Chat History (Messenger, Viber)", "Dedicated Property Management Software"]
  },
  {
    category: "Monitoring",
    prompt: "How do you monitor late payments across multiple boarders?",
    type: "single",
    options: ["Manual checking of bank accounts/notebooks", "Calendar reminders or Alarms", "Automated software alerts", "I mostly rely on memory"]
  },
  {
    category: "Pain Points",
    prompt: "What becomes the most difficult task when your dorm is fully occupied?",
    type: "multiple",
    options: ["Tracking who has and hasn't paid", "Handling maintenance requests (clogged toilets, etc.)", "Enforcing house rules (curfew, visitors)", "Mediating roommate conflicts"]
  },
  {
    category: "Payment Disputes",
    prompt: "How often do payment disputes happen (e.g. boarder claims they paid but you have no record)?",
    type: "single",
    options: ["Frequently (Every month)", "Occasionally (Every few months)", "Rarely (Once a year)", "Never"]
  },
  {
    category: "Evidence and Validation",
    prompt: "How do boarders usually send proof of online payments?",
    type: "single",
    options: ["Send screenshots via Messenger/Viber", "Email receipts", "Present physical deposit slips", "No proof needed, I just check the bank"]
  },
  {
    category: "Trust in Automation",
    prompt: "If an app could automate rent tracking for your dorm, what would make you trust it?",
    type: "multiple",
    options: ["It accurately integrates with my bank/GCash", "It provides real-time notifications", "It's built by a known company", "I would still verify manually, just use it as backup"]
  },
  {
    category: "Usability",
    prompt: "What is the most important app feature for dorm owners who aren't tech-savvy?",
    type: "single",
    options: ["Extremely simple interface (few buttons)", "Excellent customer support", "Tutorial videos built-in", "Automated summary reports via SMS"]
  },
  {
    category: "Maintenance Process",
    prompt: "How do boarders typically report maintenance issues (e.g. busted lights, broken fans)?",
    type: "multiple",
    options: ["Call or Text messages", "Facebook Messenger or Viber", "Logbook at the front desk", "In-person to the caretaker"]
  },
  {
    category: "Repair Responsibility",
    prompt: "How do you usually decide who pays for minor repairs inside a shared room?",
    type: "single",
    options: ["Dorm management always pays", "We split the cost among room occupants", "The specific boarder who broke it pays", "Depends on the written contract"]
  },
  {
    category: "Prioritization",
    prompt: "How do you handle multiple maintenance requests at once?",
    type: "single",
    options: ["First come, first served", "Based on severity (leaks/electricity first)", "I wait and batch them together for one repairman visit"]
  },
  {
    category: "Batch Repairs",
    prompt: "Have you tried scheduling minor repairs on specific days (Batching) to save money/time?",
    type: "single",
    options: ["Yes, usually weekly", "Yes, usually monthly", "No, I handle them as soon as they arise"]
  },
  {
    category: "Availability",
    prompt: "What happens when emergencies occur while you are unavailable (out of town, travelling)?",
    type: "single",
    options: ["A family member handles it", "I have a trusted caretaker/staff on site", "The boarders have to wait until I get back", "I call my on-call handyman remotely"]
  },
  {
    category: "Document Security",
    prompt: "Where do you securely store contracts and boarder IDs (Student ID / Company ID)?",
    type: "multiple",
    options: ["Physical folders in a cabinet", "Local computer folders", "Cloud Storage (Google Drive, Dropbox)", "Property Management App"]
  },
  {
    category: "Legal Compliance",
    prompt: "Which legal requirement do you find most tedious to maintain for a dorm?",
    type: "single",
    options: ["Barangay / Mayor's Permits", "BIR / Tax filings", "Fire & Safety (Sanitary/Health) inspections", "Notarizing Contracts"]
  },
  {
    category: "Time Management",
    prompt: "Which of these consumes most of your time each week?",
    type: "single",
    options: ["Chasing late rent payments", "Overseeing maintenance/cleaning", "Showing beds/rooms to prospective boarders", "Answering inquiries / Mediation"]
  },
  {
    category: "Move-out / Turnover",
    prompt: "What is your main step when turning over a bed/room after a boarder moves out?",
    type: "single",
    options: ["Deep clean and prep immediately", "Wait for a new boarder, then prep the space", "Hire an external cleaner to handle it"]
  },
  {
    category: "Advance and Deposit",
    prompt: "What is your standard deposit policy for boarders?",
    type: "single",
    options: ["1 Month Advance, 1 Month Deposit", "1 Month Advance, 2 Months Deposit", "No deposit/Advance only", "It varies depending on if they are students or working"]
  },
  {
    category: "Team Setup",
    prompt: "How is your dorm managed on a day-to-day basis?",
    type: "single",
    options: ["Solely by me", "Shared duties with family members", "I have a live-in caretaker or staff", "I use a professional Agency"]
  },
  {
    category: "Marketing",
    prompt: "What channel works best for finding new boarders?",
    type: "single",
    options: ["Facebook Marketplace & Groups", "Word of Mouth / School Partnerships", "Walk-ins (Tarpaulins outside)", "Online listing websites"]
  },
  {
    category: "Boarder Screening",
    prompt: "What is the primary criteria you require to approve a boarder?",
    type: "multiple",
    options: ["Valid Government IDs", "School Registration / Student ID", "Proof of Income / Company ID (for workers)", "Interview / Gut feeling"]
  },
  {
    category: "House Rules",
    prompt: "Which house rule is the most challenging to enforce?",
    type: "single",
    options: ["Curfew hours", "Visitor restrictions (no outsiders)", "Cleanliness in common areas/bathrooms", "Noise limits"]
  },
  {
    category: "Contract and Billing",
    prompt: "How are utility bills (water/electricity) handled in shared rooms?",
    type: "single",
    options: ["Sub-meters per room, divided by occupants", "Utilities are included in rent (All-in flat rate)", "Boarders pay extra fees for appliances (fans, laptops)", "Total dorm bill is divided equally among all boarders"]
  },
  {
    category: "Outstanding Balances",
    prompt: "How do you handle unpaid rent or utilities when a boarder wants to move out?",
    type: "single",
    options: ["Deduct directly from the deposit", "Demand payment before they can pull out their items", "Set up a promissory note/payment plan", "Mostly I just write it off as a loss"]
  }
];

const responseEl = document.getElementById("response");
const optionsContainer = document.getElementById("optionsContainer");
const progressText = document.getElementById("progressText");
const progressPercentage = document.getElementById("progressPercentage");
const progressFill = document.getElementById("progressFill");
const progressSection = document.getElementById("progressSection");
const categoryTag = document.getElementById("categoryTag");
const questionPrompt = document.getElementById("questionPrompt");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const summarySection = document.getElementById("summary");
const summaryList = document.getElementById("summaryList");
const restartBtn = document.getElementById("restartBtn");
const surveyCard = document.getElementById("surveyCard");
const surveyControls = document.getElementById("surveyControls");

// Onboarding Elements
const onboardingCard = document.getElementById("onboardingCard");
const ownerNameInput = document.getElementById("ownerNameInput");
const dormNameInput = document.getElementById("dormNameInput");
const docOwnerName = document.getElementById("docOwnerName");
const docDormName = document.getElementById("docDormName");
const consentCheck = document.getElementById("consentCheck");
const startSurveyBtn = document.getElementById("startSurveyBtn");
const consentLabelWrapper = document.getElementById("consentLabelWrapper");

let currentIndex = 0;
// Answers array now stores objects { choices: [strings], text: string }
const answers = Array(questions.length).fill(null).map(() => ({ choices: [], text: "" }));

// Onboarding Logic
function updateConsentState() {
  const isFilled = ownerNameInput.value.trim() !== "" && dormNameInput.value.trim() !== "";
  startSurveyBtn.disabled = !(isFilled && consentCheck.checked);
  startSurveyBtn.style.opacity = startSurveyBtn.disabled ? "0.5" : "1";
  
  if (consentCheck.checked) {
    consentLabelWrapper.classList.add('selected');
  } else {
    consentLabelWrapper.classList.remove('selected');
  }
}

ownerNameInput.addEventListener("input", (e) => {
  docOwnerName.textContent = e.target.value.trim() || "[Name]";
  updateConsentState();
});

dormNameInput.addEventListener("input", (e) => {
  docDormName.textContent = e.target.value.trim() || "[Dormitory Residence]";
  updateConsentState();
});

consentCheck.addEventListener("change", updateConsentState);

startSurveyBtn.addEventListener("click", () => {
  onboardingCard.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  onboardingCard.style.opacity = '0';
  onboardingCard.style.transform = 'translateY(-20px)';
  
  setTimeout(() => {
    onboardingCard.classList.add("hidden");
    
    // Reveal Survey
    surveyCard.classList.remove("hidden");
    progressSection.classList.remove("hidden");
    surveyControls.classList.remove("hidden");
    
    // Animate survey in
    surveyCard.style.opacity = '0';
    surveyCard.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      surveyCard.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      surveyCard.style.opacity = '1';
      surveyCard.style.transform = 'translateY(0)';
      
      setTimeout(() => {
        surveyCard.style.transition = '';
      }, 500);
    });
  }, 300);
});

function updateProgress() {
  const current = currentIndex + 1;
  const total = questions.length;
  const percent = Math.round((current / total) * 100);
  
  progressText.textContent = `Question ${current} of ${total}`;
  progressPercentage.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function animateCardTransition(direction, callback) {
  surveyCard.style.opacity = '0';
  surveyCard.style.transform = direction === 'next' ? 'translateY(15px)' : 'translateY(-15px)';
  
  setTimeout(() => {
    callback();
    surveyCard.style.transform = direction === 'next' ? 'translateY(-15px)' : 'translateY(15px)';
    
    requestAnimationFrame(() => {
      surveyCard.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      surveyCard.style.opacity = '1';
      surveyCard.style.transform = 'translateY(0)';
      
      setTimeout(() => {
        surveyCard.style.transition = '';
      }, 400);
    });
  }, 250);
}

function handleOptionClick(e, input, type) {
  if (type === "single") {
    // Unselect all others
    document.querySelectorAll('.option-label').forEach(lbl => {
      if (lbl !== input.parentElement) {
        lbl.classList.remove('selected');
        lbl.querySelector('input').checked = false;
      }
    });
  }
  
  // Toggle selection visually
  if (input.checked) {
    input.parentElement.classList.add('selected');
  } else {
    input.parentElement.classList.remove('selected');
  }
}

function renderQuestion() {
  const item = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  
  categoryTag.textContent = item.category;
  questionPrompt.textContent = item.prompt;
  
  // Render Options
  optionsContainer.innerHTML = '';
  optionsContainer.className = item.options.length > 3 ? "options-grid multi-col" : "options-grid";
  
  item.options.forEach((opt, idx) => {
    const isChecked = currentAnswer.choices.includes(opt);
    
    const label = document.createElement("label");
    label.className = `option-label ${isChecked ? 'selected' : ''}`;
    
    const input = document.createElement("input");
    input.type = item.type === "multiple" ? "checkbox" : "radio";
    input.name = "surveyChoice";
    input.value = opt;
    input.className = "option-input";
    input.checked = isChecked;
    
    // Add event listener to input to handle the parent class toggling
    input.addEventListener("change", (e) => handleOptionClick(e, input, item.type));
    
    const textSpan = document.createElement("span");
    textSpan.className = "option-text";
    textSpan.textContent = opt;
    
    label.appendChild(input);
    label.appendChild(textSpan);
    optionsContainer.appendChild(label);
  });

  // Render previous text response 
  responseEl.value = currentAnswer.text;

  updateProgress();

  prevBtn.disabled = currentIndex === 0;
  
  const nextText = nextBtn.querySelector('span');
  if (currentIndex === questions.length - 1) {
    nextText.textContent = "Finish Survey";
    nextBtn.style.background = "var(--success)";
    nextBtn.style.boxShadow = "0 4px 14px rgba(63, 185, 80, 0.3)";
  } else {
    nextText.textContent = "Next Question";
    nextBtn.style.background = "";
    nextBtn.style.boxShadow = "";
  }
}

function saveCurrentAnswer() {
  const checkedInputs = Array.from(document.querySelectorAll('input[name="surveyChoice"]:checked'));
  answers[currentIndex].choices = checkedInputs.map(input => input.value);
  answers[currentIndex].text = responseEl.value.trim();
}

function renderSummary() {
  summaryList.innerHTML = "";
  questions.forEach((q, index) => {
    const ans = answers[index];
    
    const card = document.createElement("article");
    card.className = "summary-item";

    const heading = document.createElement("h3");
    heading.textContent = `Q${index + 1}: ${q.category}`;

    const promptText = document.createElement("div");
    promptText.style.fontSize = "0.9rem";
    promptText.style.color = "var(--text-muted)";
    promptText.style.marginBottom = "0.5rem";
    promptText.textContent = q.prompt;

    const answer = document.createElement("p");
    
    let combinedResponse = ans.choices.join(', ');
    if (ans.text) {
      combinedResponse += combinedResponse ? `\n\nNotes: ${ans.text}` : `Notes: ${ans.text}`;
    }
    
    answer.textContent = combinedResponse || "— No response provided —";
    if (!combinedResponse) answer.style.color = "var(--text-muted)";

    card.append(heading, promptText, answer);
    summaryList.appendChild(card);
  });
}

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    saveCurrentAnswer();
    animateCardTransition('prev', () => {
      currentIndex -= 1;
      renderQuestion();
    });
  }
});

nextBtn.addEventListener("click", async () => {
  saveCurrentAnswer();
  if (currentIndex < questions.length - 1) {
    animateCardTransition('next', () => {
      currentIndex += 1;
      renderQuestion();
    });
    return;
  }

  // Finish survey logic - Save to Firebase
  const nextText = nextBtn.querySelector('span');
  const originalText = nextText.textContent;
  
  // Show loading state
  nextText.textContent = "Saving...";
  nextBtn.disabled = true;

  try {
    // Format the completed data
    const responseDocument = {
      ownerName: ownerNameInput.value.trim(),
      dormitoryName: dormNameInput.value.trim(),
      submittedAt: serverTimestamp(),
      responses: questions.map((q, index) => ({
        category: q.category,
        question: q.prompt,
        selectedOptions: answers[index].choices,
        additionalText: answers[index].text
      }))
    };

    // Save to Firestore 'surveyResponses' collection
    await addDoc(collection(db, "surveyResponses"), responseDocument);

    // Proceed to summary view on success
    renderSummary();
    surveyCard.classList.add("hidden");
    progressSection.classList.add("hidden");
    surveyControls.classList.add("hidden");
    
    summarySection.classList.remove("hidden");
    summarySection.style.opacity = '0';
    summarySection.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      summarySection.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      summarySection.style.opacity = '1';
      summarySection.style.transform = 'translateY(0)';
    });
  } catch (error) {
    console.error("Error saving to Firebase: ", error);
    alert("There was an error saving your response. Please check your connection and try again.");
    
    // Reset button state on failure
    nextText.textContent = originalText;
    nextBtn.disabled = false;
  }
});

restartBtn.addEventListener("click", () => {
  // reset answers
  answers.forEach(ans => { ans.choices = []; ans.text = ""; });
  currentIndex = 0;
  
  summarySection.classList.add("hidden");
  surveyCard.classList.remove("hidden");
  progressSection.classList.remove("hidden");
  
  renderQuestion();
  
  surveyCard.style.opacity = '0';
  surveyCard.style.transform = 'translateY(20px)';
  
  requestAnimationFrame(() => {
    surveyCard.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    surveyCard.style.opacity = '1';
    surveyCard.style.transform = 'translateY(0)';
  });
});

// Initialize first question without transition
renderQuestion();
