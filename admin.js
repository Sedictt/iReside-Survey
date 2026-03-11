import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your exact same config from script.js
const firebaseConfig = {
  apiKey: "AIzaSyA5ST_7iPTK0oeLqhROlCEn8gItAWpaI6c",
  authDomain: "ireside-survey.firebaseapp.com",
  projectId: "ireside-survey",
  storageBucket: "ireside-survey.firebasestorage.app",
  messagingSenderId: "785576727155",
  appId: "1:785576727155:web:a12cd9edf7ad452116d006",
  measurementId: "G-4WKM5NE29D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tableBody = document.getElementById('tableBody');
const mobileList = document.getElementById('mobileList');
const loadingText = document.getElementById('loadingText');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const responseModal = document.getElementById('responseModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalBody = document.getElementById('modalBody');
const modalDate = document.getElementById('modalDate');

let allGlobalResponses = [];

async function loadData() {
  try {
    const q = query(collection(db, "surveyResponses"), orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    allGlobalResponses = [];
    tableBody.innerHTML = '';
    
    // Check if mobileList exists since we just added it to HTML
    if(mobileList) mobileList.innerHTML = '';

    if (querySnapshot.empty) {
      loadingText.textContent = "No responses found yet.";
      return;
    }

    loadingText.style.display = 'none';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      allGlobalResponses.push({ id, ...data });

      // Format Dates
      let dateObj = data.submittedAt ? data.submittedAt.toDate() : new Date();
      let desktopDate = dateObj.toLocaleString();
      let mobileDate = dateObj.toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});

      // Preview Extraction
      let preview = "No answers provided";
      if (data.responses && data.responses.length > 0) {
        const firstAns = data.responses.find(r => r.selectedOptions.length > 0 || r.additionalText) || data.responses[0];
        let val = firstAns.selectedOptions.join(', ');
        if(val.length > 50) val = val.substring(0, 50) + '...';
        preview = val || firstAns.additionalText || 'Empty';
      }
      
      const countAnswers = data.responses ? data.responses.length : 0;

      // 1. Inject Desktop Row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${desktopDate}</td>
        <td>${countAnswers} Qs</td>
        <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${preview}</td>
        <td>
          <button class="view-btn" data-id="${id}">View Details</button>
        </td>
      `;
      tableBody.appendChild(tr);
      
      // 2. Inject Mobile Card (if container is present)
      if (mobileList) {
        const card = document.createElement('div');
        card.className = 'mobile-card';
        card.innerHTML = `
          <div class="mc-header">
            <span class="mc-date">${mobileDate}</span>
            <span class="mc-count">${countAnswers} answers</span>
          </div>
          <div class="mc-preview">"${preview}"</div>
          <button class="view-btn" data-id="${id}">View Full Response</button>
        `;
        mobileList.appendChild(card);
      }
    });

    // Attach listener to all view buttons (desktop + mobile)
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openModal(id);
      });
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    loadingText.textContent = "Error loading data. Check console.";
  }
}

function openModal(id) {
  const data = allGlobalResponses.find(r => r.id === id);
  if (!data) return;

  const dateStr = data.submittedAt ? data.submittedAt.toDate().toLocaleString() : "Unknown Data";
  modalDate.textContent = `Submission: ${dateStr}`;
  
  modalBody.innerHTML = '';
  
  if (data.responses) {
    data.responses.forEach((resp, index) => {
      const div = document.createElement('div');
      div.className = 'response-item';
      
      const choices = resp.selectedOptions.length > 0 
        ? resp.selectedOptions.join(', ') 
        : '<span style="opacity: 0.5">No option selected</span>';
        
      let textHtml = '';
      if (resp.additionalText) {
        textHtml = `<div class="response-text"><strong>Notes:</strong> ${resp.additionalText}</div>`;
      }
      
      div.innerHTML = `
        <div class="response-q">Q${index + 1}: ${resp.question}</div>
        <div class="response-a">${choices}</div>
        ${textHtml}
      `;
      
      modalBody.appendChild(div);
    });
  }
  
  responseModal.classList.add('active');
}

closeModalBtn.addEventListener('click', () => {
  responseModal.classList.remove('active');
});

// Close modal if clicked outside
responseModal.addEventListener('click', (e) => {
  if (e.target === responseModal) {
    responseModal.classList.remove('active');
  }
});

// CSV Export Logic
exportCsvBtn.addEventListener('click', () => {
  if (allGlobalResponses.length === 0) {
    alert("No data to export");
    return;
  }

  // Find all unique question prompts (in case schema changed across submissions)
  const allQuestionPrompts = new Set();
  allGlobalResponses.forEach(submission => {
    if (submission.responses) {
      submission.responses.forEach(r => {
        allQuestionPrompts.add(r.question);
      });
    }
  });

  const questionArray = Array.from(allQuestionPrompts);
  
  // Headers
  const headers = ['Submission Date', ...questionArray];
  let csvContent = headers.map(formatCSVField).join(',') + '\n';

  // Rows
  allGlobalResponses.forEach(submission => {
    let dateStr = submission.submittedAt ? submission.submittedAt.toDate().toLocaleString() : "";
    const row = [dateStr];

    questionArray.forEach(qPrompt => {
      // Find the specific answer within this submission
      const ansObj = submission.responses ? submission.responses.find(r => r.question === qPrompt) : null;
      if (ansObj) {
        let combined = ansObj.selectedOptions.join('; ');
        if (ansObj.additionalText) {
          combined += (combined ? " | Notes: " : "Notes: ") + ansObj.additionalText;
        }
        row.push(combined);
      } else {
        row.push("");
      }
    });

    csvContent += row.map(formatCSVField).join(',') + '\n';
  });

  // Trigger File Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `dormitory_survey_responses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

function formatCSVField(data) {
  // To handle commas and quotes inside fields for proper CSV formatting
  let stringData = String(data);
  if (stringData.includes('"') || stringData.includes(',') || stringData.includes('\n')) {
    stringData = '"' + stringData.replace(/"/g, '""') + '"';
  }
  return stringData;
}

// Initial fetch
loadData();