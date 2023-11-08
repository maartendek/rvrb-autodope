const baseurl = 'https://app.rvrb.one';
let doping = false;

const startAutoDoping = () => {
  console.log('START!');
}

const stopAutoDoping = () => {
  console.log('STOP!');
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('installed')
  // // disable by default
  // chrome.action.disable();

  // // Clear all rules to ensure only our expected rules are set
  // chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
  //   // Declare a rule to enable the action on rvrb.com pages
  //   let exampleRule = {
  //     conditions: [
  //       new chrome.declarativeContent.PageStateMatcher({
  //         pageUrl: { hostSuffix: '.rvrb.one' },
  //       })
  //     ],
  //     actions: [new chrome.declarativeContent.ShowAction()],
  //   };

  //   // Finally, apply our new array of rules
  //   let rules = [exampleRule];
  //   chrome.declarativeContent.onPageChanged.addRules(rules);
  // });
});


chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(baseurl)) {
    // set new doping status
    doping = !doping;

    // Next state will always be the opposite
    const nextState = doping === true ? 'ON' : 'OFF'

    if (nextState === "ON") {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: startAutoDoping,
      })
        .then(() => console.log("autodoping started"));
      chrome.action.setIcon({ path: 'images/rvrb-ad-on.png', tabId: tab.id });

    } else if (nextState === "OFF") {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: stopAutoDoping,
      })
        .then((msg) => console.log("autodoping stopped", msg));
      chrome.action.setIcon({ path: 'images/rvrb-ad.png', tabId: tab.id });

    }
  }
});


