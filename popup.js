document.addEventListener("DOMContentLoaded", function () {
  // Tab Navigation
  const tabs = document.querySelectorAll(".nav-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab and corresponding content
      tab.classList.add("active");
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add("active");
    });
  });

  // Speed Control
  const slider = document.getElementById("speedSlider");
  const speedValue = document.querySelector(".speed-value");
  const presetButtons = document.querySelectorAll(".preset-btn");
  const decreaseBtn = document.getElementById("decreaseBtn");
  const increaseBtn = document.getElementById("increaseBtn");

  function updateSpeed(speed) {
    speed = Math.max(0.25, Math.min(3, speed));
    speed = Math.round(speed * 100) / 100;

    speedValue.textContent = speed + "x";
    slider.value = speed;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        command: "setSpeed",
        speed: speed,
      });
    });
  }

  slider.addEventListener("input", function () {
    updateSpeed(parseFloat(this.value));
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateSpeed(parseFloat(this.dataset.speed));
    });
  });

  decreaseBtn.addEventListener("click", function () {
    updateSpeed(parseFloat(slider.value) - 0.25);
  });

  increaseBtn.addEventListener("click", function () {
    updateSpeed(parseFloat(slider.value) + 0.25);
  });

  // Theme Control
  const themeOptions = document.querySelectorAll(".theme-option");

  themeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove active class from all themes
      themeOptions.forEach((t) => t.classList.remove("active"));
      // Add active class to selected theme
      this.classList.add("active");

      // Send theme change message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          command: "setTheme",
          theme: option.dataset.theme,
        });
      });
    });
  });

  // Features Toggle Buttons
  const toggleShortsBtn = document.getElementById("toggleShortsBtn");
  const readingModeToggle = document.getElementById("readingMode");
  const intensitySlider = document.getElementById("intensity");

  // Initialize the toggle states from storage
  chrome.storage.sync.get(
    ["blockShorts", "readingMode", "readingIntensity"],
    function (result) {
      const isBlockingShorts = result.blockShorts || false;
      const isReadingMode = result.readingMode || false;
      const intensity = result.readingIntensity || 20;

      toggleShortsBtn.checked = isBlockingShorts;
      readingModeToggle.checked = isReadingMode;
      intensitySlider.value = intensity;

      // Initialize reading mode if it was enabled
      if (isReadingMode) {
        updateReadingMode();
      }
    }
  );

  toggleShortsBtn.addEventListener("change", function () {
    const isBlockingShorts = this.checked;

    // Save the state to storage
    chrome.storage.sync.set({ blockShorts: isBlockingShorts });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        command: "toggleShorts",
        blockShorts: isBlockingShorts,
      });
    });
  });

  function updateReadingMode() {
    const isEnabled = readingModeToggle.checked;
    const intensity = intensitySlider.value;

    // Save state to storage
    chrome.storage.sync.set({
      readingMode: isEnabled,
      readingIntensity: intensity,
    });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        command: "setReadingMode",
        enabled: isEnabled,
        intensity: intensity,
      });
    });
  }

  readingModeToggle.addEventListener("change", updateReadingMode);
  intensitySlider.addEventListener("input", updateReadingMode);

  // Initialize speed from storage
  chrome.storage.sync.get(["playbackSpeed"], function (result) {
    const savedSpeed = result.playbackSpeed || 1;
    updateSpeed(savedSpeed);
  });

  // Initialize theme from storage
  chrome.storage.sync.get(["theme"], function (result) {
    const savedTheme = result.theme || "default";
    const themeToActivate = document.querySelector(
      `.theme-option[data-theme="${savedTheme}"]`
    );
    if (themeToActivate) {
      themeToActivate.click();
    }
  });
});
