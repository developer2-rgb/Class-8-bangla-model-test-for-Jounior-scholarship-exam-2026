import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const CONFIG = {
  PASSWORD: "ABCDEFGBANGLASUGGESTION",
  WHATSAPP: "01780685218",
  TOTAL_PAGES: 46,
  IMAGE_PREFIX: "বাংলা model test for anuual and জুনিয়র বৃত্তি পরীক্ষা ২০২৬। ১০০% common_"
};

// Firebase Config
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

// State
let pageFlip = null;
let currentUID = getDeviceUID();

// Elements
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

// 1. Device Unique Identifier
function getDeviceUID() {
  let uid = localStorage.getItem("device_uid_bangla");
  if (!uid) {
    uid = "BANGLA-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem("device_uid_bangla", uid);
  }
  return uid;
}

// 2. Strict Anti-Screenshot & Copy Protection
function initAntiScreenshotSecurity() {
  // Disable Right Click & Context Menu
  document.addEventListener("contextmenu", e => e.preventDefault());

  // Disable Key Shortcuts (PrintScreen, Ctrl+P, Snipping Tool, Inspect)
  document.addEventListener("keyup", e => {
    if (e.key === "PrintScreen") {
      navigator.clipboard.writeText(""); // Clear Clipboard
      alert("Screenshots are strictly disabled!");
    }
  });

  document.addEventListener("keydown", e => {
    if (
      (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u' || e.key === 'c' || e.key === 'a' || e.key === 'i')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'S')) ||
      e.key === 'F12'
    ) {
      e.preventDefault();
      return false;
    }
  });

  // Screen Blur on Window Switch / Snipping Tool / Loss of Focus
  window.addEventListener("blur", () => {
    document.body.classList.add("protected-blur");
  });

  window.addEventListener("focus", () => {
    if (localStorage.getItem("approved_bangla") === "true") {
      document.body.classList.remove("protected-blur");
    }
  });
}

// 3. Firestore Approval Logic
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
    console.error("Firestore Check Error:", err);
    return false;
  }
}

// 4. Render 3D FlipBook with dynamic image names (.jpg extension)
function initFlipbook() {
  const container = document.getElementById("flipbook");
  container.innerHTML = "";

  for (let i = 1; i <= CONFIG.TOTAL_PAGES; i++) {
    const fileName = `${CONFIG.IMAGE_PREFIX}${i}.jpg`;
    const pageDiv = document.createElement("div");
    pageDiv.className = "page";
    pageDiv.innerHTML = `<img src="${fileName}" alt="Page ${i}" loading="lazy">`;
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
    pageCounter.innerText = `Page: ${e.data + 1} / ${CONFIG.TOTAL_PAGES}`;
  });
}

// 5. Unlock Mechanism
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
  localStorage.setItem("approved_bangla", "true");
  passwordModal.style.display = "none";
  document.body.classList.remove("protected-blur");
  initFlipbook();
}

// UI Buttons Logic
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
  const query = prompt(`১ থেকে ${CONFIG.TOTAL_PAGES} এর মধ্যে পেজ নম্বর দিন:`);
  if (query) {
    const pageNum = parseInt(query);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= CONFIG.TOTAL_PAGES) {
      pageFlip.flip(pageNum - 1);
    } else {
      alert("সঠিক পেজ নম্বর দিন!");
    }
  }
});

// Run Anti-Screenshot and Anti-Copy Protection on Load
initAntiScreenshotSecurity();
