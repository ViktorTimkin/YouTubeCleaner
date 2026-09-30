document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("button");

    buttons[0].addEventListener("click", async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        chrome.tabs.sendMessage(tab.id, {
            action: "findComments"
        }, (response) => {
            if (chrome.runtime.lastError) {
                alert("Ошибка: " + chrome.runtime.lastError.message);
                return;
            }

            alert("Ответ от YouTube: " + response.message);
        });
    });
});