class AutoDope {
  constructor() {
    this.isEnabled = false;
    this.titleEl = null;
    this.dopeBtn = null;
    this.mutationObserver = null;
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
      }
      return;
    }

    console.log("AutoDope: Elements found, initializing...");
    this.loadState();
    this.init();
  }

  init() {
    this.setupMutationObserver();
  }

  setupMutationObserver() {
    this.mutationObserver = new MutationObserver(() => this.onTrackChange());
    this.mutationObserver.observe(this.titleEl, {
      childList: true,
      subtree: true,
    });
  }

  onTrackChange() {
    this.dope();
  }

  loadState() {
    // Load from chrome storage
    chrome.storage.local.get("autoDope_enabled", (result) => {
      this.isEnabled = result.autoDope_enabled || false;
      console.log(`AutoDope state loaded: ${this.isEnabled ? "ON" : "OFF"}`);
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleAutoDope") {
        this.isEnabled = request.enabled;
        console.log(`AutoDope toggled: ${this.isEnabled ? "ON" : "OFF"}`);
        sendResponse({ success: true });
      }
    });
  }

  dope() {
    if (this.isEnabled && this.dopeBtn) {
      this.dopeBtn.click();
      console.log(`Auto-voted track "${this.titleEl.textContent}"`);
    }
  }

  destroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
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
