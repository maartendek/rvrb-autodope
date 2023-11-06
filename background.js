const baseurl = 'https://app.rvrb.one';

const startAutoDoping = () => {
  console.log('START!);
}

const stopAutoDoping = () => {
  console.log('STOP!);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(baseurl)) {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });
  }
});

if (nextState === "ON") {
    await chrome.scripting.executeScript({
      target : {tabId : getTabId()},
      func : startAudoDoping,
    })
    .then(() => console.log("autodoping started"));
} else if (nextState === "OFF") {
    await chrome.scripting.executeScript({
      target : {tabId : getTabId()},
      func : stopAudoDoping,
    })
    .then(() => console.log("autodoping stopped"));
}
