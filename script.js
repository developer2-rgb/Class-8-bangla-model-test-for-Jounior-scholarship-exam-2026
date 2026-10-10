import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// ⚙️ CONFIGURATION (আপনার প্রয়োজন অনুযায়ী পরিবর্তন করুন)
// ==========================================
const CONFIG = {
  PASSWORD: "ABCDZYX2N2026", // আপনার পাসওয়ার্ড
  WHATSAPP: "01780685218",   // আপনার হোয়াটসঅ্যাপ নম্বর
  TOTAL_PAGES: 170,           // মোট পেজ সংখ্যা
  PRINTED_START_PAGE: 709,    // প্রথম প্রিন্টেড পেজ নম্বর
  PHYSICAL_START_PAGE: 6      // প্রিন্টেড পেজ যে পেজ থেকে শুরু (Physical Page 6 = 709)
};

// Firebase Config (প্রয়োজনে আপনার নিজস্ব Firebase Config দিন)
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTemplate12345",
  authDomain: "jse-b-d575f.firebaseapp.com",
  projectId: "jse-b-d575f",
  storageBucket: "jse-b-d575f.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// State Variables
let pageFlip = null;
let currentUID = getDeviceUID();

// DOM Elements
const passwordModal = document.getElementById("passwordModal");
const passwordBox = document.getElementById("passwordBox");
const approvalBox = document.getElementById("approvalBox");
const passwordInput = document.getElementById("passwordInput");
const submitPasswordBtn = document.getElementById("submitPasswordBtn");
const uidDisplay = document.getElementById("uidDisplay");
const copyUidBtn = document.getElementById("copyUidBtn");
const checkStatusBtn = document.getElementById("checkStatusBtn");
const pageCounter = document.getElementById("pageCounter");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const searchBtn = document.getElementById("searchBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

document.getElementById("waNumberDisplay").innerText = CONFIG.WHATSAPP;

// 1. Unique Device UID Generator
function getDeviceUID() {
  let uid = localStorage.getItem("device_uid");
  if (!uid) {
    uid = "UID-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem("device_uid", uid);
  }
  return uid;
}

// 2. Anti-Security Features
function initSecurity() {
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u' || e.key === 'c')) {
      e.preventDefault();
    }
  });

  window.addEventListener("blur", () => {
    document.body.classList.add("protected-blur");
  });

  window.addEventListener("focus", () => {
    if (localStorage.getItem("approved") === "true") {
      document.body.classList.remove("protected-blur");
    }
  });
}

// 3. Check Firestore Approval
async function checkApproval(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().approved === true;
    } else {
      await setDoc(doc(db, "users", uid), {
        approved: false,
        created: new Date().toISOString()
      });
      return false;
    }
  } catch (err) {
    console.error("Firebase Check Error:", err);
    return false;
  }
}

// 4. Initialize Flipbook
function initFlipbook() {
  const container = document.getElementById("flipbook");
  container.innerHTML = "";

  for (let i = 1; i <= CONFIG.TOTAL_PAGES; i++) {
    const pageNum = String(i).padStart(3, '0');
    const pageDiv = document.createElement("div");
    pageDiv.className = "page";
    pageDiv.innerHTML = `<img src="page${pageNum}.jpg" alt="Page ${i}" loading="lazy">`;
    container.appendChild(pageDiv);
  }

  pageFlip = new St.PageFlip(container, {
    width: 400,
    height: 600,
    size: "stretch",
    minWidth: 300,
    maxWidth: 1000,
    minHeight: 400,
    maxHeight: 1400,
    maxShadowOpacity: 0.5,
    showCover: true,
    mobileScrollSupport: false
  });

  pageFlip.loadFromHTML(document.querySelectorAll(".page"));

  pageFlip.on("flip", (e) => {
    updateCounter(e.data);
  });
}

// 5. Update Live Counter
function updateCounter(pageIndex) {
  const physicalPage = pageIndex + 1;
  let printedText = "-";

  if (physicalPage >= CONFIG.PHYSICAL_START_PAGE) {
    const printedPage = CONFIG.PRINTED_START_PAGE + (physicalPage - CONFIG.PHYSICAL_START_PAGE);
    printedText = printedPage;
  }

  pageCounter.innerText = `Page: ${physicalPage} / ${CONFIG.TOTAL_PAGES} (Printed: ${printedText})`;
}

// 6. Event Listeners & Logic
submitPasswordBtn.addEventListener("click", async () => {
  const pass = passwordInput.value.trim();
  if (pass === CONFIG.PASSWORD) {
    passwordBox.style.display = "none";
    approvalBox.style.display = "block";
    uidDisplay.value = currentUID;

    const isApproved = await checkApproval(currentUID);
    if (isApproved) {
      unlockApp();
    }
  } else {
    alert("ভুল পাসওয়ার্ড!");
  }
});

copyUidBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(currentUID);
  alert("UID কপি করা হয়েছে!");
});

checkStatusBtn.addEventListener("click", async () => {
  const isApproved = await checkApproval(currentUID);
  if (isApproved) {
    unlockApp();
  } else {
    alert("আপনার UID এখনও Approve করা হয়নি। অনুগ্রহ করে WhatsApp-এ যোগাযোগ করুন।");
  }
});

function unlockApp() {
  localStorage.setItem("approved", "true");
  passwordModal.style.display = "none";
  document.body.classList.remove("protected-blur");
  initFlipbook();
}

// UI Buttons
prevBtn.addEventListener("click", () => pageFlip && pageFlip.flipPrev());
nextBtn.addEventListener("click", () => pageFlip && pageFlip.flipNext());

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

searchBtn.addEventListener("click", () => {
  const query = prompt(`খোঁজার জন্য Printed Page (যেমন ${CONFIG.PRINTED_START_PAGE}) অথবা Physical Page নম্বর দিন:`);
  if (query) {
    const pageNum = parseInt(query);
    if (!isNaN(pageNum)) {
      if (pageNum >= CONFIG.PRINTED_START_PAGE) {
        const targetPhysical = CONFIG.PHYSICAL_START_PAGE + (pageNum - CONFIG.PRINTED_START_PAGE);
        pageFlip.flip(targetPhysical - 1);
      } else if (pageNum >= 1 && pageNum <= CONFIG.TOTAL_PAGES) {
        pageFlip.flip(pageNum - 1);
      } else {
        alert("সঠিক পেজ নম্বর দিন!");
      }
    }
  }
});

// Run Security on Load
initSecurity();
