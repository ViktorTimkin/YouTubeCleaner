chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "findComments") {

        const comments = document.querySelectorAll(
            "ytd-comment-thread-renderer"
        );

        sendResponse({
            message: `Найдено комментариев: ${comments.length}`
        });
    }

    return true;
});