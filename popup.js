document.addEventListener("DOMContentLoaded", async () => {
  const toggleButton = document.getElementById("toggleButton");
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");
  const errorMessage = document.getElementById("errorMessage");

  // Load current state
  const state = await chrome.storage.local.get("autoDope_enabled");
  const isEnabled = state.autoDope_enabled || false;

  updateUI(isEnabled);

  // Toggle button click handler
  toggleButton.addEventListener("click", async () => {
    const newState = !isEnabled;
    await chrome.storage.local.set({ autoDope_enabled: newState });

    // Tell background script to update icon
    chrome.runtime.sendMessage({
      action: "updateIcon",
      enabled: newState,
    });

    // Update popup UI
    updateUI(newState);

    // Notify content script
    const tabs = await chrome.tabs.query({ url: "https://app.rvrb.one/*" });
    tabs.forEach((tab) => {
      chrome.tabs
        .sendMessage(tab.id, {
          action: "toggleAutoDope",
          enabled: newState,
        })
        .catch((err) => {
          console.log("Content script not loaded on this tab");
        });
    });

    // Close popup after 300ms
    setTimeout(() => {
      window.close();
    }, 300);
  });

  function updateUI(enabled) {
    if (enabled) {
      toggleButton.textContent = "✓ Disable AutoDope";
      toggleButton.classList.remove("off");
      toggleButton.classList.add("on");
      statusIndicator.classList.add("on");
      statusText.textContent = "Status: ON";
      statusText.classList.remove("off");
      statusText.classList.add("on");
    } else {
      toggleButton.textContent = "Enable AutoDope";
      toggleButton.classList.remove("on");
      toggleButton.classList.add("off");
      statusIndicator.classList.remove("on");
      statusText.textContent = "Status: OFF";
      statusText.classList.remove("on");
      statusText.classList.add("off");
    }
  }
});
