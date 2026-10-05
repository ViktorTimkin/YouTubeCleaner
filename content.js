chrome.runtime.onMessage.addListener((message) => {

    if (message.action === "findComments") {
        prepareCommentsForDeletion();
    }
});

async function prepareCommentsForDeletion() {

    const counter = createCounter();

    let previousCount = 0;
    let stableCount = 0;

    counter.textContent = "Загружаем комментарии...";

    // Сначала прокручиваем страницу до конца
    while (stableCount < 5) {

        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth"
        });

        await wait(1000);

        const currentCount = document.querySelectorAll(
            '[aria-label*="Delete activity item"], [aria-label*="Удалить"]'
        ).length;

        counter.textContent = `Загружено: ${currentCount}`;

        if (currentCount === previousCount) {
            stableCount++;
        } else {
            stableCount = 0;
        }

        previousCount = currentCount;
    }

    const total = document.querySelectorAll(
        '[aria-label*="Delete activity item"], [aria-label*="Удалить"]'
    ).length;

    counter.textContent = `Найдено комментариев: ${total}`;

    // Спрашиваем пользователя
    const confirmed = confirm(
        `Найдено комментариев: ${total}\n\nУдалить все комментарии?`
    );

    if (!confirmed) {
        counter.textContent = "Удаление отменено";
        return;
    }

    await deleteAllComments(total, counter);
}

async function deleteAllComments(total, counter) {

    let deleted = 0;

    while (true) {

        const deleteButtons = document.querySelectorAll(
            '[aria-label*="Delete activity item"], [aria-label*="Удалить"]'
        );

        if (deleteButtons.length === 0) {
            counter.textContent = `Готово: ${deleted} / ${total}`;
            alert(`Удаление завершено.\nУдалено: ${deleted} / ${total}`);
            break;
        }

        const button = deleteButtons[0];

        button.click();

        deleted++;

        counter.textContent = `Удалено: ${deleted} / ${total}`;

        await waitForButtonToDisappear(button);
    }
}

async function waitForButtonToDisappear(button) {

    for (let i = 0; i < 40; i++) {

        if (!document.contains(button)) {
            return;
        }

        await wait(100);
    }
}

function createCounter() {

    const counter = document.createElement("div");

    counter.id = "youtube-cleaner-counter";

    counter.textContent = "Запуск...";

    counter.style.position = "fixed";
    counter.style.top = "20px";
    counter.style.right = "20px";
    counter.style.zIndex = "999999";
    counter.style.padding = "12px 18px";
    counter.style.background = "black";
    counter.style.color = "white";
    counter.style.fontSize = "16px";
    counter.style.borderRadius = "8px";

    document.body.appendChild(counter);

    return counter;
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}