(() => {
const WORDS = [
  "CRANE",
  "PLANT",
  "BRAVE",
  "SHINE",
  "GHOST",
  "FLAME",
  "BLINK",
  "TRACE",
  "SNAKE",
  "GRACE",
  "FROST",
  "BRICK",
  "CHART",
  "GLORY",
  "HONEY",
  "RIVER",
  "STONE",
  "BLEND",
  "CLOUD",
  "LIGHT",
  "STEEL",
  "SHARP",
  "CROWN",
  "SWEET",
  "QUICK",
  "NIGHT",
  "DREAM",
  "PRIDE",
  "FLASH",
  "TRUST",
  "WATER",
  "HEART",
  "MIGHT",
  "SOUND",
  "GLASS",
  "BRAIN",
  "WORTH",
  "PEACE",
  "GRAIN",
  "PLAIN",
  "SUGAR",
  "BLOOM",
  "FAVOR",
  "CATCH",
  "THINK",
  "BRAND",
  "FLEET",
  "GHOST",
  "FENCE",
  "FRESH",
  "FIELD",
  "QUEST",
  "BUNCH",
  "RANGE",
  "HAPPY",
  "SMILE",
  "LIGHT",
  "CLEAN",
  "BLAST",
  "QUILT",
  "STORM",
  "LAUGH",
  "GRACE",
  "PRIZE",
  "PLUSH",
  "VIVID",
  "ALIVE",
  "FORCE",
  "FAITH",
  "SHINE",
  "SCALE",
  "TRACK",
  "VOUCH",
  "FLOUR",
  "CYCLE",
  "TIGER",
  "YOUTH",
  "VOICE",
  "SPARK",
  "MUSIC",
  "BRAVE",
  "SOLID",
  "CANDY",
  "GIVER",
  "BLAZE",
  "TRAIL",
  "SWIFT",
  "HONEY",
  "LOVER",
  "PEARL",
  "FROST",
  "GLOWN",
  "BERRY",
  "QUARK",
  "PRANK",
];

let WORD = "";
let currentRow = 0;
let currentCol = 0;
const maxAttempts = 6;
let modalVisible = false;
let previousGuesses = [];

document.addEventListener("DOMContentLoaded", () => {
  WORD = getRandomWord();
  generateGrid();
  setupKeyboard();
  createModal();
});

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateGrid() {
  const board = document.getElementById("game-board");
  board.innerHTML = ""; // Clear previous grid
  for (let r = 0; r < maxAttempts; r++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function setupKeyboard() {
  const keyboardContainer = document.getElementById("keyboard-container");
  keyboardContainer.innerHTML = ""; // Clear previous keyboard
  const keys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
  ];

  keys.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach((key) => {
      const keyButton = document.createElement("button");
      keyButton.textContent = key;
      keyButton.setAttribute("data-key", key);
      keyButton.classList.add("key");

      if (key === "Enter") {
        keyButton.classList.add("wide");
      } else if (key === "Backspace") {
        keyButton.classList.add("wide");
        keyButton.innerHTML = "⌫";
      }

      keyButton.addEventListener("click", () => handleKey({ key }));
      rowDiv.appendChild(keyButton);
    });

    keyboardContainer.appendChild(rowDiv);
  });

  // Add physical keyboard support
  document.addEventListener("keydown", handleKey);
}

function handleKey(e) {
  if (modalVisible) return; // Disable input while modal visible
  if (e.key === "Backspace") {
    removeLetter();
  } else if (e.key === "Enter") {
    submitGuess();
  } else if (/^[a-zA-Z]$/.test(e.key) && currentCol < 5) {
    insertLetter(e.key.toUpperCase());
  }
}

function insertLetter(letter) {
  const row = document.querySelectorAll(".row")[currentRow];
  const tile = row.children[currentCol];
  tile.textContent = letter;
  tile.setAttribute("data-letter", letter);
  currentCol++;
}

function removeLetter() {
  if (currentCol === 0) return;
  currentCol--;
  const row = document.querySelectorAll(".row")[currentRow];
  const tile = row.children[currentCol];
  tile.textContent = "";
  tile.removeAttribute("data-letter");
}

function getCurrentGuess() {
  const row = document.querySelectorAll(".row")[currentRow];
  let guess = "";
  for (let tile of row.children) {
    guess += tile.getAttribute("data-letter") || "";
  }
  return guess;
}

async function submitGuess() {
  const guess = getCurrentGuess();
  if (guess.length !== 5) {
    showToast("Enter 5 letters");
    return;
  }

  // Check for duplicate guess
  if (previousGuesses.includes(guess)) {
    showToast("You've already guessed that word!");
    const row = document.querySelectorAll(".row")[currentRow];
    row.classList.add("shake");

    setTimeout(() => {
      row.classList.remove("shake");
      for (let tile of row.children) {
        tile.textContent = "";
        tile.removeAttribute("data-letter");
      }
      currentCol = 0;
    }, 600);
    return;
  }

  const isValid = await validateWord(guess);
  if (!isValid) {
    const row = document.querySelectorAll(".row")[currentRow];
    row.classList.add("shake");
    showToast("Invalid word!");

    setTimeout(() => {
      row.classList.remove("shake");
      for (let tile of row.children) {
        tile.textContent = "";
        tile.removeAttribute("data-letter");
      }
      currentCol = 0;
    }, 600);

    return;
  }
  previousGuesses.push(guess);
  checkGuess(guess);
}

async function validateWord(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );
    const data = await res.json();
    if (data.title === "No Definitions Found") return false;
    return true;
  } catch (err) {
    showToast("Error checking word");
    return false;
  }
}

function checkGuess(guess) {
  const row = document.querySelectorAll(".row")[currentRow];
  const tiles = Array.from(row.children);
  const wordArray = WORD.split("");
  const guessArray = guess.split("");
  const colors = Array(5).fill("absent");

  // Step 1: correct positions
  guessArray.forEach((char, i) => {
    if (char === wordArray[i]) {
      colors[i] = "correct";
      wordArray[i] = null;
    }
  });

  // Step 2: present but wrong position
  guessArray.forEach((char, i) => {
    if (colors[i] !== "correct" && wordArray.includes(char)) {
      colors[i] = "present";
      wordArray[wordArray.indexOf(char)] = null;
    }
  });

  // Step 3: animate and apply classes
  tiles.forEach((tile, i) => {
    setTimeout(() => {
      tile.style.animation = "flipIn 0.5s ease";
      tile.classList.add(colors[i]);
      updateKeyColor(guessArray[i], colors[i]);
    }, i * 300);

    setTimeout(() => {
      tile.style.animation = "bounce 0.3s ease";
    }, i * 300 + 500);
  });

  // Check win or lose after animations complete
  setTimeout(() => {
    if (guess === WORD) {
      showToast("🎉 You Win!");
      showModal("🎉 Congratulations! You won! Would you like to play again?");
    } else {
      currentRow++;
      currentCol = 0;
      if (currentRow === maxAttempts) {
        showToast(`❌ Game Over! Word: ${WORD}`);
        showModal(`❌ Game Over! Word: ${WORD}`);
      }
    }
  }, 1800);
}

function updateKeyColor(letter, status) {
  const key = document.querySelector(`.key[data-key="${letter}"]`);
  if (!key) return;

  const existing = key.classList;
  if (existing.contains("correct")) return;
  if (
    status === "correct" ||
    (status === "present" && !existing.contains("present"))
  ) {
    key.classList.remove("absent");
    key.classList.add(status);
  } else if (!existing.contains("correct") && status === "absent") {
    key.classList.add("absent");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

/* Modal logic */
function createModal() {
  const restartModal = document.getElementById("restart-modal");
  const restartButton = document.getElementById("restart-button");

  restartButton.addEventListener("click", () => {
    resetGame();
    hideModal();
  });
}

function hideModal() {
  const modal = document.getElementById("restart-modal");
  modal.classList.toggle("hidden");
  modalVisible = false;
}

function showModal(message) {
  const modal = document.getElementById("restart-modal");
  const modalMessage = document.getElementById("modal-message");
  modalMessage.innerText = message;
  modal.classList.toggle("hidden");
  modalVisible = true;
}

function resetGame() {
  WORD = getRandomWord();
  currentRow = 0;
  currentCol = 0;
  previousGuesses = [];
  generateGrid();
  resetKeyboard();
}

function resetKeyboard() {
  document.querySelectorAll(".key").forEach((key) => {
    key.classList.remove("correct", "present", "absent");
  });
}

})();