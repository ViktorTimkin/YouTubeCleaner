document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("commentsButton").addEventListener("click", () => {
        chrome.runtime.sendMessage({
            action: "openComments"
        });
    });

    document.getElementById("likesButton").addEventListener("click", () => {
        chrome.runtime.sendMessage({
            action: "openLikes"
        });
    });

    document.getElementById("historyButton").addEventListener("click", () => {
        chrome.runtime.sendMessage({
            action: "openHistory"
        });
    });

});