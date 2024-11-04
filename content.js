let currentTheme = "dark";

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === "setSpeed") {
    const video = document.querySelector("video");
    if (video) {
      video.playbackRate = request.speed;
    }
  } else if (request.command === "setTheme") {
    currentTheme = request.theme;
    applyTheme(request.theme);
  } else if (request.command === "setReadingMode") {
    updateReadingMode(request.enabled, request.intensity);
  } else if (request.command === "toggleShorts") {
    if (request.blockShorts) {
      enableBlockShorts();
    } else {
      location.reload(); // Reload page to restore Shorts
    }
  }
});

// Theme application function
function applyTheme(theme) {
  // Remove any existing theme classes
  document.body.classList.remove(
    "theme-dark",
    "theme-midnight",
    "theme-forest",
    "theme-ocean"
  );

  // Add new theme class
  document.body.classList.add(`theme-${theme}`);
}

// Get the elements
const readingModeToggle = document.getElementById("readingMode");
const intensitySlider = document.getElementById("intensity");

// Updated Reading Mode function using overlay
function updateReadingMode() {
  const enabled = readingModeToggle.checked;
  const intensity = intensitySlider.value;

  // Remove existing overlay if present
  const existingOverlay = document.getElementById("reading-mode-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  if (enabled) {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "reading-mode-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(255, 249, 229, ${intensity / 100});
      pointer-events: none;
      z-index: 9999;
      transition: background-color 0.3s ease;
    `;
    document.body.appendChild(overlay);
  }
}

// Event listeners
readingModeToggle.addEventListener("change", updateReadingMode);
intensitySlider.addEventListener("input", updateReadingMode);

// Initialize with default values
updateReadingMode();

// Block Shorts function
function enableBlockShorts() {
  const removeShorts = () => {
    Array.from(document.querySelectorAll(`a[href^="/shorts"]`)).forEach((a) => {
      let parent = a.parentElement;
      while (
        parent &&
        (!parent.tagName.startsWith("YTD-") ||
          parent.tagName === "YTD-THUMBNAIL")
      ) {
        parent = parent.parentElement;
      }
      if (parent) {
        parent.remove();
      }
    });
  };

  const observer = new MutationObserver(removeShorts);
  observer.observe(document, { childList: true, subtree: true });

  removeShorts();
}

// Initialize reading mode from storage
chrome.storage.sync.get(["readingMode", "readingIntensity"], function (result) {
  if (result.readingMode) {
    updateReadingMode(true, result.readingIntensity || 50);
  }
});
