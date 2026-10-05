chrome.runtime.onMessage.addListener((message) => {

    if (message.action === "openComments") {

        chrome.tabs.create({
            url: "https://myactivity.google.com/page?hl=ru&utm_medium=web&utm_source=youtube&page=youtube_comments"
        }).then((tab) => {

            const listener = (tabId, changeInfo) => {

                if (tabId === tab.id && changeInfo.status === "complete") {

                    chrome.tabs.onUpdated.removeListener(listener);

                    chrome.tabs.sendMessage(tab.id, {
                        action: "findComments"
                    }, (response) => {

                        if (chrome.runtime.lastError) {
                            console.log(
                                "Ошибка:",
                                chrome.runtime.lastError.message
                            );
                            return;
                        }

                        console.log("Ответ:", response);
                    });
                }
            };

            chrome.tabs.onUpdated.addListener(listener);
        });
    }
});