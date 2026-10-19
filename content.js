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
    this.setupNavigationListener();
    this.initializeWithRetry();
  }

  setupNavigationListener() {
    // Listen for page navigation/reload
    window.addEventListener("beforeunload", () => {
      console.log("AutoDope: Page unloading, cleaning up...");
      this.destroy();
    });

    // Listen for history changes (SPA navigation)
    window.addEventListener("popstate", () => {
      console.log("AutoDope: Navigation detected, reinitializing...");
      this.destroy();
      this.retryCount = 0;
      this.initializeWithRetry();
    });

    // Listen for dynamic content changes (if the app uses dynamic routing)
    const observer = new MutationObserver((mutations) => {
      // Check if main content was replaced
      const mainContentReplaced = mutations.some(
        (mutation) =>
          mutation.removedNodes.length > 0 &&
          Array.from(mutation.removedNodes).some(
            (node) =>
              node.nodeType === 1 &&
              (node.id === "trackTitle" ||
                node.classList.contains("track-container")),
          ),
      );

      if (mainContentReplaced) {
        console.log("AutoDope: Main content changed, reinitializing...");
        this.destroy();
        this.retryCount = 0;
        this.initializeWithRetry();
      }
    });

    // Observe body for major structural changes
    observer.observe(document.body, {
      childList: true,
      subtree: false,
    });
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
    this.dope();
  }

  setupMutationObserver() {
    // Clean up old observer if it exists
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    this.mutationObserver = new MutationObserver(() => this.onTrackChange());
    this.mutationObserver.observe(this.titleEl, {
      childList: true,
      subtree: true,
    });

    console.log("AutoDope: Mutation observer set up");
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
    console.log("AutoDope: Destroying instance...");
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.titleEl = null;
    this.dopeBtn = null;
  }
}

// Auto-initialize
let autoDopeInstance = null;

if (!autoDopeInstance) {
  autoDopeInstance = new AutoDope();
}

// Add to window for console access
window.autoDope = autoDopeInstance;
