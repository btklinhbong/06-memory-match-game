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
  // If this element is missing, stop here so we do not get a null error.
  if (!moveCounterElement) {
    return;
  }

  // Show the latest move count on the page.
  moveCounterElement.textContent = `${moveCount}`;
}

function updateTimerDisplay() {
  // If the timer element is missing, stop to avoid a null error.
  if (!timerElement) {
    return;
  }

  // Show the formatted time (MM:SS) on the page.
  timerElement.textContent = `${formatTime(timerSeconds)}`;
}

function startTimer() {
  // If this is not null, a timer is already running.
  if (timerIntervalId !== null) {
    return;
  }

  // Save the interval ID so we can stop it later with clearInterval.
  timerIntervalId = setInterval(function () {
    // Add one second, then refresh the timer text on screen.
    timerSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  // If no timer is running, there is nothing to stop.
  if (timerIntervalId === null) {
    return;
  }

  // Stop the running interval and reset the saved ID.
  clearInterval(timerIntervalId);
  timerIntervalId = null;
}

function resetTurnState() {
  // Clear selected cards and unlock the board for the next turn.
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function finishGame() {
  // Stop the timer first, then show a summary of the result.
  stopTimer();
  alert(`You won in ${moveCount} moves and ${formatTime(timerSeconds)}!`);
}

function handleMatchedCards() {
  // Count this successful pair.
  matchedPairs += 1;

  // Disable clicks so matched cards stay in place.
  firstCard.removeEventListener("click", handleCardClick);
  secondCard.removeEventListener("click", handleCardClick);

  resetTurnState();

  // End the game when all pairs have been matched.
  if (matchedPairs === uniqueEmojis.length) {
    finishGame();
  }
}

function handleUnmatchedCards() {
  // Wait a moment so the player can see both cards before flipping them back.
  unflipTimeoutId = setTimeout(function () {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetTurnState();
    unflipTimeoutId = null;
  }, 1000);
}

function checkForMatch() {
  // Read the emoji value stored on each selected card.
  const firstEmoji = firstCard.getAttribute("data-emoji");
  const secondEmoji = secondCard.getAttribute("data-emoji");

  // If both values match, keep them matched; otherwise flip them back.
  if (firstEmoji === secondEmoji) {
    handleMatchedCards();
  } else {
    handleUnmatchedCards();
  }
}

function handleCardClick(event) {
  // currentTarget is the card element that received this click listener.
  const clickedCard = event.currentTarget;

  // Ignore clicks while two cards are being compared.
  if (lockBoard) {
    return;
  }

  // Ignore clicking the same card twice in one turn.
  if (clickedCard === firstCard) {
    return;
  }

  // Ignore cards that are already face-up.
  if (clickedCard.classList.contains("flipped")) {
    return;
  }

  // Start the timer on the player's first valid move.
  if (!hasTimerStarted) {
    hasTimerStarted = true;
    startTimer();
  }

  clickedCard.classList.add("flipped");

  // First click of the turn: remember it and wait for the second click.
  if (firstCard === null) {
    firstCard = clickedCard;
    return;
  }

  // Second click of the turn: lock input and evaluate the pair.
  secondCard = clickedCard;
  lockBoard = true;

  // A move is completed only after two cards are selected.
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
  // If cards are waiting to flip back, cancel that pending timeout.
  if (unflipTimeoutId !== null) {
    clearTimeout(unflipTimeoutId);
    unflipTimeoutId = null;
  }

  // Reset timer state.
  stopTimer();
  timerSeconds = 0;
  hasTimerStarted = false;

  // Reset score and turn-tracking state.
  moveCount = 0;
  matchedPairs = 0;
  resetTurnState();

  // Update UI before building a new shuffled board.
  updateMoveCounter();
  updateTimerDisplay();

  const emojiDeck = createDeck();
  shuffleDeck(emojiDeck);
  renderCards(emojiDeck);
}

if (restartButton) {
  // Let the player restart at any time.
  restartButton.addEventListener("click", resetGame);
}

// Start the first game immediately when the script loads.
resetGame();