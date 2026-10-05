document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("button");

    buttons[0].addEventListener("click", () => {

        chrome.runtime.sendMessage({
            action: "openComments"
        });

    });
});