// 8 unique emojis for the memory game.
const uniqueEmojis = ["😀", "🐶", "🍕", "🚀", "🎮", "🌈", "⚽", "🎵"];

const gameBoard = document.querySelector("#game-board");
const moveCounterElement = document.querySelector("#move-counter");
const timerElement = document.querySelector("#timer");
const restartButton = document.querySelector("#restart-button");

// State management variables.
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moveCount = 0;
let matchedPairs = 0;
let timerSeconds = 0;
let timerIntervalId = null;
let hasTimerStarted = false;
let unflipTimeoutId = null;

// Randomize the deck in place using the Fisher-Yates shuffle.
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[randomIndex];
    deck[randomIndex] = temp;
  }
}

// Create a fresh deck by duplicating the emoji array (16 cards).
function createDeck() {
  return uniqueEmojis.concat(uniqueEmojis);
}

// Convert seconds to MM:SS format for the timer display.
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minutesText = String(minutes).padStart(2, "0");
  const secondsText = String(seconds).padStart(2, "0");
  return `${minutesText}:${secondsText}`;
}

function updateMoveCounter() {
  if (!moveCounterElement) {
    return;
  }

  moveCounterElement.textContent = `${moveCount}`;
}

function updateTimerDisplay() {
  if (!timerElement) {
    return;
  }

  timerElement.textContent = `${formatTime(timerSeconds)}`;
}

function startTimer() {
  if (timerIntervalId !== null) {
    return;
  }

  timerIntervalId = setInterval(function () {
    timerSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerIntervalId === null) {
    return;
  }

  clearInterval(timerIntervalId);
  timerIntervalId = null;
}

function resetTurnState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function finishGame() {
  stopTimer();
  alert(`You won in ${moveCount} moves and ${formatTime(timerSeconds)}!`);
}

function handleMatchedCards() {
  matchedPairs += 1;

  firstCard.removeEventListener("click", handleCardClick);
  secondCard.removeEventListener("click", handleCardClick);

  resetTurnState();

  if (matchedPairs === uniqueEmojis.length) {
    finishGame();
  }
}

function handleUnmatchedCards() {
  unflipTimeoutId = setTimeout(function () {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetTurnState();
    unflipTimeoutId = null;
  }, 1000);
}

function checkForMatch() {
  const firstEmoji = firstCard.getAttribute("data-emoji");
  const secondEmoji = secondCard.getAttribute("data-emoji");

  if (firstEmoji === secondEmoji) {
    handleMatchedCards();
  } else {
    handleUnmatchedCards();
  }
}

function handleCardClick(event) {
  const clickedCard = event.currentTarget;

  if (lockBoard) {
    return;
  }

  if (clickedCard === firstCard) {
    return;
  }

  if (clickedCard.classList.contains("flipped")) {
    return;
  }

  if (!hasTimerStarted) {
    hasTimerStarted = true;
    startTimer();
  }

  clickedCard.classList.add("flipped");

  if (firstCard === null) {
    firstCard = clickedCard;
    return;
  }

  secondCard = clickedCard;
  lockBoard = true;

  moveCount += 1;
  updateMoveCounter();

  checkForMatch();
}

// Build card elements from the shuffled deck and add them to the game board.
function renderCards(deck) {
  if (!gameBoard) {
    return;
  }

  // Clear old cards before rendering again.
  gameBoard.innerHTML = "";

  for (let i = 0; i < deck.length; i += 1) {
    const emoji = deck[i];

    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-emoji", emoji);
    card.addEventListener("click", handleCardClick);

    const cardInner = document.createElement("div");
    cardInner.className = "card-inner";

    const cardFront = document.createElement("div");
    cardFront.className = "card-front";
    cardFront.textContent = `${emoji}`;

    const cardBack = document.createElement("div");
    cardBack.className = "card-back";

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    gameBoard.appendChild(card);
  }
}

function resetGame() {
  if (unflipTimeoutId !== null) {
    clearTimeout(unflipTimeoutId);
    unflipTimeoutId = null;
  }

  stopTimer();
  timerSeconds = 0;
  hasTimerStarted = false;

  moveCount = 0;
  matchedPairs = 0;
  resetTurnState();

  updateMoveCounter();
  updateTimerDisplay();

  const emojiDeck = createDeck();
  shuffleDeck(emojiDeck);
  renderCards(emojiDeck);
}

if (restartButton) {
  restartButton.addEventListener("click", resetGame);
}

resetGame();