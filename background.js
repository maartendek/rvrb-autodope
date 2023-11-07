const baseurl = 'https://app.rvrb.one';

const startAutoDoping = () => {
  console.log('START!');
}

const stopAutoDoping = () => {
  console.log('STOP!');
}

chrome.runtime.onInstalled.addListener(() => {
  // disable by default
  chrome.action.disable();

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on rvrb.one pages
    let exampleRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: '.rvrb.one' },
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    };

    // Finally, apply our new array of rules
    let rules = [exampleRule];
    chrome.declarativeContent.onPageChanged.addRules(rules);
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

    if (nextState === "ON") {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: startAudoDoping,
      })
        .then(() => console.log("autodoping started"));
    } else if (nextState === "OFF") {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: stopAudoDoping,
      })
        .then(() => console.log("autodoping stopped"));
    }
  }
});


