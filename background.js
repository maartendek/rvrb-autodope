// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("AutoDope extension installed");
  chrome.storage.local.set({ autoDope_enabled: false });
});

// Listen for storage changes and update icon
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.autoDope_enabled) {
    const isEnabled = changes.autoDope_enabled.newValue;
    updateIcon(isEnabled);
  }
});

// Update icon based on state
function updateIcon(isEnabled) {
  const iconPath = isEnabled
    ? {
        16: "icons/icon-ad-on.png",
        48: "icons/icon-ad-on.png",
        128: "icons/icon-ad-on.png",
      }
    : {
        16: "icons/icon-ad.png",
        48: "icons/icon-ad.png",
        128: "icons/icon-ad.png",
      };

  chrome.action.setIcon({ path: iconPath });
}
