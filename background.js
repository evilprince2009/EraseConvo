chrome.runtime.onMessage.addListener(((e, a, t) => {
    "action" in e && ("STORE" === e.action ? chrome.storage.local.set(e.data, (() => {
        e.response && chrome.tabs.sendMessage(a.tab.id, e.response)
    })) : "DELETE" === e.action ? chrome.storage.local.remove(e.data, (() => {
        e.response && chrome.tabs.sendMessage(a.tab.id, e.response)
    })) : "REMOVE" === e.action || "SCROLL" === e.action ? chrome.tabs.query({
        active: !0,
        currentWindow: !0
    }, (a => {
        chrome.tabs.sendMessage(a[0].id, {
            tabId: a[0].id,
            ...e
        })
    })) : "STOP" === e.action ? chrome.tabs.query({
        active: !0,
        currentWindow: !0
    }, (e => {
        chrome.storage.local.set({
            [e[0].url]: {}
        }, (() => {
            chrome.tabs.sendMessage(e[0].id, {
                tabId: e[0].id,
                action: "RELOAD"
            })
        }))
    })) : "CHECK_ALREADY_REMOVING" === e.action && a.tab && a.tab.active && chrome.storage.local.get([a.tab.url], (e => {
        e && 0 !== Object.keys(e).length && ("isRemoving" in e[a.tab.url] ? chrome.tabs.sendMessage(a.tab.id, {
            tabId: a.tab.id,
            action: "REMOVE"
        }) : "confirmSuccess" in e[a.tab.url] && chrome.tabs.sendMessage(a.tab.id, {
            tabId: a.tab.id,
            action: "CONFIRM_SUCCESS"
        }))
    })))
})), chrome.tabs.onUpdated.addListener(((e, a, t) => {}));