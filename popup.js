document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("button");

    // Комментарии
    buttons[0].addEventListener("click", () => {

        chrome.runtime.sendMessage({
            action: "openComments"
        });

    });

    // Лайки
    buttons[1].addEventListener("click", () => {

        chrome.runtime.sendMessage({
            action: "openLikes"
        });

    });
});