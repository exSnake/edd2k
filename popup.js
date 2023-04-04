const textArea = document.getElementById('text-area');
const label = document.getElementById('text-area-label');
let storageItems = new Set();

chrome.storage.local.get(["ed2kLinks"], function (items) {
  try {
    storageItems = new Set(JSON.parse(items.ed2kLinks));
  } catch (e) {
    console.log("error", e)
    storageItems = new Set();
  }
  if (storageItems.size > 0) {
    textArea.value = Array.from(storageItems.values()).join('\n');
    label.innerText = 'ed2k links - parsed ' + storageItems.size + ' links';
  }
});

document.getElementById('clear-content').addEventListener('click', () => {
  textArea.value = '';
  label.innerText = 'ed2k links';
  storageItems = new Set();
  chrome.storage.local.set({ "ed2kLinks": JSON.stringify([...storageItems]) });
});


document.getElementById('read-content').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    function getEd2kLinksFromCurrentTab() {
      var aTags = Array.from(document.getElementsByTagName('a'));
      setTimeout(() => {
        var collection = document.getElementsByTagName('a');
        for (var i = 0; i < collection.length; i++) {
          if (collection[i].childElementCount > 0 && collection[i].childNodes[0].alt !== undefined) {
            if (collection[i].childNodes[0].alt.toLowerCase().indexOf("ringrazia") > -1) {
              window.location.href = collection[i].href
            }
          }
        }
        return false;
      }, 1000);
      return aTags.filter(c => c.href.indexOf("ed2k") === 0).map(r => r.href);
    };

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getEd2kLinksFromCurrentTab,
    }).then((tags) => {
      if (tags[0].result.length > 0) {
        tags[0].result.map(c => storageItems.add(c));
        textArea.value = Array.from(storageItems.values()).join('\n');
        label.innerText = 'ed2k links - parsed ' + storageItems.size + ' links';
        chrome.storage.local.set({ "ed2kLinks": JSON.stringify([...storageItems]) });
      }
    });
  });
});