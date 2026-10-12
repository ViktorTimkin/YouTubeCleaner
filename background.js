
chrome.runtime.onMessage.addListener((message, sender) => {

    if (message.action === "openComments") {
        openActivityPage(
            "https://myactivity.google.com/page?hl=ru&utm_medium=web&utm_source=youtube&page=youtube_comments",
            "findComments"
        );
    }

    if (message.action === "openLikes") {
        openActivityPage(
            "https://myactivity.google.com/page?hl=ru&utm_medium=web&utm_source=youtube&page=youtube_likes",
            "findLikes"
        );
    }

    if (message.action === "openHistory") {
        openActivityPage(
            "https://myactivity.google.com/myactivity",
            "findHistory"
        );
    }

    if (message.action === "closeCurrentTab" && sender.tab?.id !== undefined) {
        chrome.tabs.remove(sender.tab.id);
    }
});

function openActivityPage(url, action) {

    chrome.tabs.create({ url: url }).then((tab) => {

        const listener = (tabId, changeInfo) => {

            if (tabId === tab.id && changeInfo.status === "complete") {

                chrome.tabs.onUpdated.removeListener(listener);

                chrome.tabs.sendMessage(tab.id, {
                    action: action
                });
            }
        };

        chrome.tabs.onUpdated.addListener(listener);
    });
}
