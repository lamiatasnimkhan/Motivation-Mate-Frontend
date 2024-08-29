let isWorking = true;
let workTime = 25 * 60;//1 * 20; // 1 minute for testing
let breakTime = 5 * 60;//1 * 10; // 1 minute for testing
let currentTime = workTime;
let timerInterval;
let isRunning = false;

// Elements
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const startButton = document.getElementById('start');
const workElement = document.getElementById('work');
const breakElement = document.getElementById('break');

// Update timer display
function updateTimer() {
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  minutesElement.textContent = minutes.toString().padStart(2, '0');
  secondsElement.textContent = seconds.toString().padStart(2, '0');
}

// Update work/break mode display
function updateMode() {
  if (isRunning) {
    if (isWorking) {
      workElement.classList.add('active');
      breakElement.classList.remove('active');
    } else {
      workElement.classList.remove('active');
      breakElement.classList.add('active');
    }
  } else {
    workElement.classList.remove('active');
    breakElement.classList.remove('active');
  }
}

// Start the timer
function start() {
  //if (isRunning) return;

  isRunning = true;
  startButton.textContent = 'Reset';
  updateMode();

  timerInterval = setInterval(() => {
    if (currentTime > 0) {
      currentTime--;
      updateTimer();
    } else {
      clearInterval(timerInterval);

      // Switch mode after work/break time ends
      if (isWorking) {
        isWorking = false;
        currentTime = breakTime; // Set to break time
        updateMode();
        start(); // Automatically start the break time
      } else {
        // Both work and break are done, reset everything
        reset();
      }
    }
  }, 1000);
}

// Reset the timer
function reset() {
  clearInterval(timerInterval);
  isRunning = false;
  currentTime = workTime; // Reset to work time
  isWorking = true; // Reset to work mode
  startButton.textContent = 'Start';
  updateMode();
  updateTimer();
}

// Initialize the timer and UI
updateTimer();
updateMode();

// Attach event listener to start and reset buttons
startButton.addEventListener('click', () => {
  if (isRunning) {
    reset();
  } else {
    start();
  }
});
