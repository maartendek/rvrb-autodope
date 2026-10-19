class AutoDope {
  constructor() {
    this.isEnabled = false;
    this.titleEl = null;
    this.dopeBtn = null;
    this.mutationObserver = null;
    this.toggleBtn = null;
    this.maxRetries = 10;
    this.retryCount = 0;
    this.retryDelay = 500; // milliseconds

    this.setupMessageListener();
    this.initializeWithRetry();
  }

  initializeWithRetry() {
    this.titleEl = document.querySelector("#trackTitle a");
    this.dopeBtn = document.querySelector("[title='Vote Up']");

    if (!this.titleEl || !this.dopeBtn) {
      this.retryCount++;

      if (this.retryCount <= this.maxRetries) {
        console.log(
          `AutoDope: Elements not found, retrying... (${this.retryCount}/${this.maxRetries})`,
        );
        setTimeout(() => this.initializeWithRetry(), this.retryDelay);
      } else {
        console.error(
          "AutoDope: Required elements not found after multiple retries",
        );
        console.log("AutoDope: Debugging info:");
        console.log(
          "- #trackTitle a:",
          document.querySelector("#trackTitle a"),
        );
        console.log(
          '- [title="Vote Up"]:',
          document.querySelector("[title='Vote Up']"),
        );
        console.log(
          "- All elements with title attribute:",
          document.querySelectorAll("[title]"),
        );
      }
      return;
    }

    console.log("AutoDope: Elements found, initializing...");
    this.loadState();
    this.init();
  }

  init() {
    this.setupMutationObserver();
    this.createToggleButton();
  }

  setupMutationObserver() {
    this.mutationObserver = new MutationObserver(() => this.onTrackChange());
    this.mutationObserver.observe(this.titleEl, {
      childList: true,
      subtree: true,
    });
  }

  onTrackChange() {
    if (this.titleEl) {
      console.log("Track changed:", this.titleEl.textContent);
    }
    if (this.isEnabled && this.dopeBtn) {
      this.dopeBtn.click();
      console.log("Auto-voted track");
    }
  }

  createToggleButton() {
    this.toggleBtn = document.createElement("button");
    this.toggleBtn.textContent = "AutoDope";
    this.toggleBtn.setAttribute("aria-label", "Toggle AutoDope");

    Object.assign(this.toggleBtn.style, {
      position: "absolute",
      bottom: "50px",
      right: "20px",
      padding: "8px 12px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      backgroundColor: "#f0f0f0",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      zIndex: "9999",
      transition: "all 0.3s ease",
    });

    this.toggleBtn.addEventListener("click", () => this.toggle());
    document.body.appendChild(this.toggleBtn);
    this.updateButtonState();
  }

  loadState() {
    // Load from chrome storage
    chrome.storage.local.get("autoDope_enabled", (result) => {
      this.isEnabled = result.autoDope_enabled || false;
      if (this.toggleBtn) this.updateButtonState();
    });
  }

  saveState() {
    chrome.storage.local.set({ autoDope_enabled: this.isEnabled });
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.saveState();
    this.updateButtonState();
    console.log(`AutoDope is now ${this.isEnabled ? "ON" : "OFF"}`);
  }

  updateButtonState() {
    if (!this.toggleBtn) return;

    if (this.isEnabled) {
      this.toggleBtn.style.backgroundColor = "#4CAF50";
      this.toggleBtn.style.color = "white";
      this.toggleBtn.textContent = "✓ AutoDope ON";
    } else {
      this.toggleBtn.style.backgroundColor = "#f0f0f0";
      this.toggleBtn.style.color = "black";
      this.toggleBtn.textContent = "AutoDope";
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleAutoDope") {
        this.isEnabled = request.enabled;
        if (this.toggleBtn) {
          this.updateButtonState();
        }
        sendResponse({ success: true });
      }
    });
  }

  destroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.toggleBtn) {
      this.toggleBtn.removeEventListener("click", () => this.toggle());
      this.toggleBtn.remove();
    }
  }
}

// Auto-initialize
let autoDopeInstance = null;

if (!autoDopeInstance) {
  autoDopeInstance = new AutoDope();
}

// Add to window for console access
window.autoDope = autoDopeInstance;
