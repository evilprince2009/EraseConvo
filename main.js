MORE_BUTTONS_HOLDER_QUERY = '[aria-label="Message actions"]', MORE_BUTTONS_QUERY = '[aria-label="More"]', REMOVE_BUTTON_QUERY = '[aria-label="Remove message"],[aria-label="Remove Message"]', OKAY_BUTTON_QUERY = '[aria-label="Okay"]', COULDNT_REMOVE_QUERY = "._3quh._30yy._2t_._5ixy.layerCancel", REMOVE_CONFIRMATION_QUERY = '[aria-label="Remove"]', SCROLLER_QUERY = '[role="main"] .buofh1pr.j83agx80.eg9m0zos.ni8dbmo4.cbu4d94t.gok29vw1', MESSAGES_QUERY = "[aria-label=Messages]", LOADING_QUERY = '[role="main"] svg[aria-valuetext="Loading..."]', TOP_OF_CHAIN_QUERY = ".d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.gk29lw5a.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.fe6kdd0r.mau55g9w.c8b282yb.hrzyx87i.o3w64lxj.b2s5l15y.hnhda86s.oo9gr5id.oqcyycmt", INBOX_QUERY = ".q5bimw55.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.eg9m0zos.l9j0dhe7.du4w35lb.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.c3g1iek1.k4xni2cv", STICKER_QUERY = "[aria-label$=sticker]", LINK_QUERY = "[alt='XMA Header Image']", THUMBS_UP = '[aria-label="Thumbs up sticker"]', STATUS_MESSAGES = ".nred35xi.fdg1wqfs.ae35evdt.lt9micmv.gl4o1x5y", TIMESTAMPS = '[data-scope="date_break"]';
const STATUS = {
    CONTINUE: "continue",
    ERROR: "error",
    COMPLETE: "complete"
};

function sleep(e) {
    return new Promise((t => setTimeout(t, e)))
}

function getSiblings(e) {
    for (var t = [], o = e.parentNode.firstChild; o;) 1 === o.nodeType && o !== e && t.push(o), o = o.nextSibling;
    return t
}

function removeBadRowsFromDOM() {
    const e = [...document.querySelectorAll(`${STICKER_QUERY}, ${LINK_QUERY}, ${THUMBS_UP}`)];
    for (let t of e) {
        let e = t;
        try {
            for (;
                "row" !== e.getAttribute("role");) e = e.parentElement;
            e.remove()
        } catch (e) {}
    }
    const t = [...document.querySelectorAll(`${STATUS_MESSAGES}, ${TIMESTAMPS}`)];
    for (let e of t) {
        let t = e;
        try {
            for (;
                "row" !== t.getAttribute("role");) t = t.parentElement;
            t.style.display = "none"
        } catch (e) {}
    }
}
async function unsendAllVisibleMessages(e, t) {
    removeBadRowsFromDOM();
    [...document.querySelectorAll(MORE_BUTTONS_HOLDER_QUERY)].map((e => {
        e.click()
    }));
    let o = [...document.querySelectorAll(MORE_BUTTONS_QUERY)].filter((e => e.getAttribute("data-clickcount") < 5));
    const a = o.length;
    for (; o.length > 0;) {
        [...o].map((e => {
            e.click();
            const t = e.getAttribute("data-clickcount");
            e.setAttribute("data-clickcount", t ? t + 1 : 1)
        })), await sleep(2e3);
        let e = document.querySelectorAll(REMOVE_BUTTON_QUERY);
        for (; e.length > 0;) {
            [...e].map((e => {
                e.click()
            })), await sleep(5e3);
            let t = document.querySelectorAll(REMOVE_CONFIRMATION_QUERY);
            for (; t.length > 0;) {
                for (let e of t) e.click();
                await sleep(5e3), t = document.querySelectorAll(REMOVE_CONFIRMATION_QUERY)
            }
            e = document.querySelectorAll(REMOVE_BUTTON_QUERY)
        }
        o = [...document.querySelectorAll(MORE_BUTTONS_QUERY)].filter((e => e.getAttribute("data-clickcount") < 5))
    }
    if (e) return {
        status: STATUS.CONTINUE,
        data: 500
    };
    const n = document.querySelector(SCROLLER_QUERY),
        r = document.querySelector(TOP_OF_CHAIN_QUERY);
    if (await sleep(2e3), r) return {
        status: STATUS.COMPLETE
    };
    if (!n || 0 === n.scrollTop) return {
        status: STATUS.ERROR
    }; {
        let e = null,
            t = 3;
        do {
            try {
                n.scrollTop = 0
            } catch (e) {}
            await sleep(2e3), e = document.querySelector(LOADING_QUERY), await sleep(2e3), t--
        } while (e && t > 0)
    }
    return 0 === a ? {
        status: STATUS.CONTINUE,
        data: 500
    } : {
        status: STATUS.CONTINUE,
        data: 5e3
    }
}
async function runner(e) {
    for (let t = 0; t < e || !e; ++t) {
        const o = await unsendAllVisibleMessages(t == e - 1, 100);
        if (o.status === STATUS.CONTINUE) await sleep(o.data);
        else if (o.status === STATUS.COMPLETE) return STATUS.COMPLETE
    }
    return STATUS.CONTINUE
}
async function longChain(e, t, o) {
    o = o || "";
    for (let o = 0; o < e || !e; ++o) {
        const e = await runner(t);
        if (e === STATUS.COMPLETE) return {
            status: e
        }
    }
    return {
        status: STATUS.CONTINUE
    }
}

function scrollToBottomHelper() {
    let e = document.querySelectorAll(INBOX_QUERY)[0];
    e.scrollTop = e.scrollHeight
}
async function scrollToBottom(e) {
    for (let t = 0; t < e; ++t) scrollToBottomHelper(), await sleep(2e3)
}
const currentURL = location.protocol + "//" + location.host + location.pathname;
async function removeHandler(e) {
    const t = await longChain(5, 5);
    t.status === STATUS.COMPLETE ? chrome.runtime.sendMessage({
        action: "STORE",
        data: {
            [currentURL]: {
                confirmSuccess: !0
            }
        },
        response: {
            tabId: e,
            action: "RELOAD"
        }
    }) : t.status === STATUS.CONTINUE && chrome.runtime.sendMessage({
        action: "STORE",
        data: {
            [currentURL]: {
                isRemoving: !0
            }
        },
        response: {
            tabId: e,
            action: "RELOAD"
        }
    })
}
chrome.runtime.onMessage.addListener((async function (e, t) {
    if ("en" !== document.documentElement.lang) return void alert("ERROR: Detected non-English language. To EraseConvo work properly change your Language to English.");
    const o = e.tabId;
    if ("REMOVE" === e.action) removeHandler(o);
    else if ("CONFIRM_REMOVE" === e.action) confirm("Continue removing messages?") && removeHandler(o);
    else if ("CONFIRM_SUCCESS" === e.action) {
        await sleep(1e4);
        const e = runner(3);
        e.status === STATUS.CONTINUE ? (chrome.runtime.sendMessage({
            action: "STORE",
            data: {
                [currentURL]: {
                    isRemoving: !0
                }
            }
        }), removeHandler(o)) : e.status === STATUS.COMPLETE ? chrome.runtime.sendMessage({
            action: "STORE",
            data: {
                [currentURL]: {
                    lastCleared: (new Date).toDateString()
                }
            }
        }) : chrome.runtime.sendMessage({
            action: "STORE",
            data: {
                [currentURL]: {
                    isRemoving: !0
                }
            },
            response: {
                tabId: o,
                action: "RELOAD"
            }
        })
    } else "SCROLL" === e.action ? scrollToBottom(100) : "RELOAD" === e.action && (window.location = window.location.pathname)
})), chrome.runtime.sendMessage({
    action: "CHECK_ALREADY_REMOVING"
});