document.querySelector("#erase-convo").addEventListener("click", (() => {
    confirm("Pressing OK will start removing all messages from the chat. Are you sure?") && chrome.extension.sendMessage({
        action: "REMOVE"
    })
})), document.querySelector("#scroll-down").addEventListener("click", (() => {
    chrome.extension.sendMessage({
        action: "SCROLL"
    })
})), document.querySelector("#quit").addEventListener("click", (() => {
    chrome.extension.sendMessage({
        action: "STOP"
    })
})), chrome.tabs.query({
    active: !0,
    currentWindow: !0
}, (e => {
    chrome.storage.local.get([e[0].url], (s => {
        s && 0 !== Object.keys(s).length && "lastCleared" in s[e[0].url] && (document.getElementById("LastCleared").innerHTML = "Last Cleared: " + s[e[0].url].lastCleared)
    }))
}));
const messengers = ["https://www.messenger.com", "http://www.messenger.com", "https://messenger.com/", "http://messenger.com/"];
chrome.tabs.query({
    active: !0,
    currentWindow: !0
}, (e => {
    const s = e[0].url;
    messengers.some((e => s.startsWith(e))) || alert(`Oops !! EraseConvo can't perform as intended. You must be on messenger.com , looks like you are currently on ${s} :)`)
}));