
/* =========================
   MY LITTLE DIARY
   JAVASCRIPT
========================= */

const $ = (id) => document.getElementById(id);

// STORAGE
const getData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

let diaries = getData("littleDiaryEntries");
let memories = getData("littleDiaryMemories");
let selectedMood = "";
let editingId = null;

// DAILY DATE
$("diaryDate").value = new Date().toISOString().split("T")[0];

// NAVIGATION
$("menuBtn").addEventListener("click", () => {
  $("navMenu").classList.toggle("active");
});

document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => {
    $("navMenu").classList.remove("active");
  });
});

// DAILY QUOTES
const quotes = [
  "You deserve a life that feels as good as it looks. ♡",
  "Bloom at your own pace, little flower. 🌷",
  "You are allowed to start again. 🎀",
  "Little by little, you are becoming yourself.",
  "Your story is beautiful, even on the quiet days.",
  "Be gentle with yourself, sweetheart. 🦢",
  "Every day is another chance to bloom."
];

const today = new Date();
const quoteIndex = today.getDate() % quotes.length;
$("dailyQuote").textContent = quotes[quoteIndex];

// MOOD SELECTION
document.querySelectorAll(".mood-options button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood-options button")
      .forEach(item => item.classList.remove("selected"));

    button.classList.add("selected");
    selectedMood = button.dataset.mood;
  });
});

// SAVE DIARIES
$("saveDiary").addEventListener("click", () => {
  const title = $("diaryTitle").value.trim();
  const date = $("diaryDate").value;
  const content = $("diaryContent").value.trim();

  if (!title || !date || !content) {
    alert("Please fill in your title, date and story ♡");
    return;
  }

  if (!selectedMood && editingId === null) {
    alert("Choose your mood first, sweetheart! 🎀");
    return;
  }

  if (editingId !== null) {
    const index = diaries.findIndex(item => item.id === editingId);

    if (index !== -1) {
      diaries[index] = {
        ...diaries[index],
        title,
        date,
        content,
        mood: selectedMood || diaries[index].mood
      };
    }

    editingId = null;
    $("saveDiary").textContent = "Save my story ♡";
  } else {
    diaries.unshift({
      id: Date.now(),
      title,
      date,
      content,
      mood: selectedMood
    });
  }

  localStorage.setItem("littleDiaryEntries", JSON.stringify(diaries));

  resetDiaryForm();
  renderDiaries();
  renderCalendar();

  alert("Your little story has been saved! ♡");
});

// RESET FORM
function resetDiaryForm() {
  $("diaryTitle").value = "";
  $("diaryDate").value = new Date().toISOString().split("T")[0];
  $("diaryContent").value = "";
  selectedMood = "";

  document.querySelectorAll(".mood-options button")
    .forEach(button => button.classList.remove("selected"));
}

// DISPLAY DIARIES
function renderDiaries(search = "") {
  const container = $("diaryEntries");
  container.innerHTML = "";

  const filtered = diaries.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.content.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML =
      '<p class="empty-message">No stories found. Start writing your little moments ♡</p>';
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "entry-card";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "entry-meta";
    meta.textContent = `${item.date} • ${item.mood} ${getMoodEmoji(item.mood)}`;

    const content = document.createElement("p");
    content.textContent = item.content;

    const actions = document.createElement("div");
    actions.className = "entry-actions";

    const edit = document.createElement("button");
    edit.textContent = "Edit ♡";
    edit.addEventListener("click", () => editDiary(item.id));

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteDiary(item.id));

    actions.append(edit, remove);
    card.append(title, meta, content, actions);
    container.appendChild(card);
  });
}

function getMoodEmoji(mood) {
  const emojis = {
    Happy: "😊",
    Loved: "🥰",
    Sad: "🥺",
    Tired: "😴",
    Calm: "🦋"
  };

  return emojis[mood] || "♡";
}

// EDIT DIARY
function editDiary(id) {
  const item = diaries.find(diary => diary.id === id);
  if (!item) return;

  editingId = id;

  $("diaryTitle").value = item.title;
  $("diaryDate").value = item.date;
  $("diaryContent").value = item.content;
  selectedMood = item.mood;

  document.querySelectorAll(".mood-options button").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.mood === item.mood
    );
  });

  $("saveDiary").textContent = "Update my story ♡";

  document.getElementById("write").scrollIntoView({
    behavior: "smooth"
  });
}

// DELETE DIARY
function deleteDiary(id) {
  if (!confirm("Are you sure you want to delete this story?")) return;

  diaries = diaries.filter(item => item.id !== id);

  localStorage.setItem("littleDiaryEntries", JSON.stringify(diaries));

  renderDiaries();
  renderCalendar();
}

// SEARCH DIARY
$("searchDiary").addEventListener("input", event => {
  renderDiaries(event.target.value);
});

// SAVE MEMORY
$("saveMemory").addEventListener("click", () => {
  const caption = $("memoryCaption").value.trim();
  const file = $("memoryPhoto").files[0];

  if (!caption || !file) {
    alert("Add a caption and choose a photo first ♡");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image file.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Please choose a photo smaller than 2 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    memories.unshift({
      id: Date.now(),
      caption,
      image: reader.result
    });

    try {
      localStorage.setItem(
        "littleDiaryMemories",
        JSON.stringify(memories)
      );

      $("memoryCaption").value = "";
      $("memoryPhoto").value = "";

      renderMemories();
      alert("Your memory has been saved! 🌷");
    } catch (error) {
      alert("Storage is full. Try using a smaller photo.");
    }
  };

  reader.readAsDataURL(file);
});

// DISPLAY MEMORIES
function renderMemories() {
  const gallery = $("memoryGallery");
  gallery.innerHTML = "";

  if (memories.length === 0) {
    gallery.innerHTML =
      '<p class="empty-message">Your memories will bloom here 🌷</p>';
    return;
  }

  memories.forEach(memory => {
    const item = document.createElement("div");
    item.className = "memory-item";

    const image = document.createElement("img");
    image.src = memory.image;
    image.alt = memory.caption;

    const caption = document.createElement("p");
    caption.textContent = memory.caption;

    const remove = document.createElement("button");
    remove.textContent = "Remove memory";
    remove.addEventListener("click", () => deleteMemory(memory.id));

    item.append(image, caption, remove);
    gallery.appendChild(item);
  });
}

// DELETE MEMORY
function deleteMemory(id) {
  if (!confirm("Delete this memory?")) return;

  memories = memories.filter(item => item.id !== id);

  localStorage.setItem(
    "littleDiaryMemories",
    JSON.stringify(memories)
  );

  renderMemories();
}

// CALENDAR
let calendarDate = new Date();

function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  $("monthYear").textContent =
    calendarDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

  const grid = $("calendarGrid");
  grid.innerHTML = "";

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  weekdays.forEach(day => {
    const cell = document.createElement("div");
    cell.className = "day-name";
    cell.textContent = day;
    grid.appendChild(cell);
  });

  const todayString = new Date().toISOString().split("T")[0];

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= lastDate; day++) {
    const cell = document.createElement("div");
    const dateString =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    cell.textContent = day;

    if (diaries.some(item => item.date === dateString)) {
      cell.classList.add("has-entry");
      cell.title = "You have a diary entry!";
    }

    if (dateString === todayString) {
      cell.classList.add("today");
    }

    grid.appendChild(cell);
  }
}

$("prevMonth").addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
});

$("nextMonth").addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
});

// INITIAL DISPLAY
renderDiaries();
renderMemories();
renderCalendar();

// OPEN MY LITTLE DIARY
$("openDiary").addEventListener("click", () => {
  $("home").scrollIntoView({
    behavior: "smooth"
  });
});

/* =========================
   DIARY COLOR THEMES
========================= */

const diaryThemes = {
  pink: {
    pink: "#e99bb8",
    dark: "#c96f94",
    light: "#fff0f5",
    soft: "#fff8fa",
    text: "#765766",
    muted: "#ad8d9b",
    border: "#f4dce6"
  },

  lavender: {
    pink: "#b9a5e8",
    dark: "#9075c5",
    light: "#f0eaff",
    soft: "#faf8ff",
    text: "#655879",
    muted: "#a295b8",
    border: "#e5dcf5"
  },

  blue: {
    pink: "#a5cbea",
    dark: "#659bc9",
    light: "#eaf5ff",
    soft: "#f5faff",
    text: "#536d83",
    muted: "#91a9bd",
    border: "#d8e9f7"
  }
};

function changeDiaryTheme(themeName) {
  const theme = diaryThemes[themeName];

  if (!theme) return;

  const root = document.documentElement;

  root.style.setProperty("--pink", theme.pink);
  root.style.setProperty("--dark-pink", theme.dark);
  root.style.setProperty("--light-pink", theme.light);
  root.style.setProperty("--soft-pink", theme.soft);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--border", theme.border);

  localStorage.setItem("littleDiaryTheme", themeName);

  document.querySelectorAll(".theme-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.theme === themeName
    );
  });
}

// THEME BUTTONS
document.querySelectorAll(".theme-btn").forEach(button => {
  button.addEventListener("click", () => {
    changeDiaryTheme(button.dataset.theme);
  });
});

// LOAD SAVED THEME
const savedTheme = localStorage.getItem("littleDiaryTheme") || "pink";
changeDiaryTheme(savedTheme);
/* =========================
   MY LITTLE PROFILE
========================= */

function loadProfile() {
  const savedProfile = JSON.parse(
    localStorage.getItem("littleDiaryProfile") || "null"
  );

  if (!savedProfile) return;

  $("profileName").value = savedProfile.name || "";

  $("welcomeName").textContent = savedProfile.name
    ? `Welcome back, ${savedProfile.name} ♡`
    : "Welcome, sweetheart! ♡";

  if (savedProfile.photo) {
    $("profileAvatar").innerHTML = "";

    const img = document.createElement("img");
    img.src = savedProfile.photo;
    img.alt = "Profile photo";

    $("profileAvatar").appendChild(img);
  }
}

$("saveProfile").addEventListener("click", () => {
  const name = $("profileName").value.trim();
  const file = $("profilePhoto").files[0];

  if (!name) {
    alert("Please enter your nickname first ♡");
    return;
  }

  const saveData = (photo) => {
    const profile = {
      name: name,
      photo: photo || null
    };

    try {
      localStorage.setItem(
        "littleDiaryProfile",
        JSON.stringify(profile)
      );

      $("welcomeName").textContent =
        `Welcome back, ${name} ♡`;

      if (photo) {
        $("profileAvatar").innerHTML = "";

        const img = document.createElement("img");
        img.src = photo;
        img.alt = "Profile photo";

        $("profileAvatar").appendChild(img);
      }

      alert(`Your profile has been saved, ${name}! 🎀`);

    } catch (error) {
      alert("The photo may be too large. Try a smaller photo.");
    }
  };

  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Please choose a photo smaller than 1.5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => saveData(reader.result);
    reader.readAsDataURL(file);

  } else {
    const oldProfile = JSON.parse(
      localStorage.getItem("littleDiaryProfile") || "null"
    );

    saveData(oldProfile ? oldProfile.photo : null);
  }
});

loadProfile();
