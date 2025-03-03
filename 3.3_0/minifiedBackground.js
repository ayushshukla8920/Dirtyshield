let allowedIPs = [];
const getIPs = async () => {
        let e = chrome.runtime.getManifest();
        return (allowedIPs = e.metadata.ip || []), e.metadata.ip || [];
    },
    fetchDomainIp = async (e) => {
        try {
            await getIPs();
            let t = new URL(e).hostname;
            if (t.includes("pscollege841.examly")) return "34.171.215.232";
            let n = await fetch(`https://dns.google/resolve?name=${t}`),
                r = await n.json(),
                a = r.Answer?.find((e) => 1 === e.type)?.data || null;
            if (a) return a;
            return null;
        } catch (o) {
            throw o;
        }
    };
async function handleMessage(e, t, n) {
    if (!t.id && !t.url) return n({ status: "Error", message: "Unauthorized sender" }), !1;
    try {
        let { id: r, type: a, instruction: o } = e;
        if (!r) return n({ code: "Error", info: "Unauthorized origin" }), !1;
        if ("EXECUTE_API" !== a) return n({ code: "Error", info: "Unknown type" }), !1;
        if (!o || !o.target || !o.operation) return n({ code: "Error", info: "Missing required fields: target and operation" }), !1;
        let { target: s, operation: i, args: l = [] } = o,
            d = chrome;
        for (let u of s.split(".")) if (!(d = d[u])) return n({ code: "Error", info: `Target not found: ${s}` }), !1;
        if ("function" != typeof d[i]) return n({ code: "Error", info: `Invalid operation: ${i}` }), !1;
        let c = d[i],
            f = c.apply(d, l);
        return f && "function" == typeof f.then ? f.then((e) => n({ code: "Success", info: e })).catch((e) => n({ code: "Error", info: e.message })) : n({ code: "Success", info: f }), !0;
    } catch (g) {
        n({ code: "Error", info: g.message });
    }
}
chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.getDynamicRules((e) => {
        let t = e.map((e) => e.id);
        chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: t });
    });
}),
    chrome.runtime.onMessageExternal.addListener(
        (e, t, n) => (
            fetchDomainIp(t.url)
                .then((r) => (r && allowedIPs.includes(r) ? handleMessage(e, t, n) : (n({ status: "Error", message: "Unauthorized origin" }), !1)))
                .catch((e) => {
                    n({ status: "Error", message: "Failed to validate origin" });
                }),
            !0
        )
    ),
    chrome.tabs.query({}, async (e) => {
        for (let t of e) {
            if (!t.url) continue;
            let n = t.url;
            try {
                let r = await fetchDomainIp(n);
                (r && allowedIPs.includes(r)) ||
                    chrome.tabs.reload(t.id, () => {
                        chrome.runtime.lastError;
                    });
            } catch (a) {}
        }
    });
const getInstalledExtensions = () => {
    // chrome.management.getAll((e) => e);
    console.log("Hello");
};
setInterval(getInstalledExtensions, 3e3), chrome.runtime.onMessage.addListener(handleMessage);
