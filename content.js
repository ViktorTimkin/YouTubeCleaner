
chrome.runtime.onMessage.addListener((message) => {

    if (message.action === "findComments") {
        prepareCommentsForDeletion();
    }

    if (message.action === "findLikes") {
        findDeleteAllButton();
    }

    if (message.action === "findHistory") {
        deleteAllHistory();
    }
});


async function prepareCommentsForDeletion() {

    const counter = createCounter();

    let previousCount = 0;
    let stableCount = 0;

    counter.textContent = "Загружаем комментарии...";

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

            await wait(1000);

            chrome.runtime.sendMessage({
                action: "closeCurrentTab"
            });

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


async function findDeleteAllButton() {

    await wait(2000);

    const elements = Array.from(document.querySelectorAll("*"));

    const deleteAllButton = elements.find(element =>
        element.textContent.trim() === "Удалить все"
    );

    if (!deleteAllButton) {
        alert("Кнопка «Удалить все» не найдена");
        return;
    }

    deleteAllButton.click();

    await wait(500);

    const confirmButtons = Array.from(document.querySelectorAll("*"));

    const confirmDeleteButton = confirmButtons.find(element =>
        element.textContent.trim() === "Удалить"
    );

    if (!confirmDeleteButton) {
        alert("Кнопка подтверждения «Удалить» не найдена");
        return;
    }

    confirmDeleteButton.click();

    // Ждём, пока Google обработает удаление лайков
    await wait(3000);

    chrome.runtime.sendMessage({
        action: "closeCurrentTab"
    });
}



async function deleteAllHistory() {

    // 1. Нажимаем «Удалить»
    const deleteButton = await waitForText(["Удалить"], 15000);

    if (!deleteButton) {
        alert("Не найдена кнопка «Удалить»");
        return;
    }

    deleteButton.click();

    // 2. Выбираем «За все время»
    const allTimeButton = await waitForText(
        ["За все время", "За всё время"],
        15000
    );

    if (!allTimeButton) {
        alert("Не найден пункт «За все время»");
        return;
    }

    allTimeButton.click();

    // 3. Ждём окно подтверждения или сообщение об отсутствии истории
    const start = Date.now();
    let confirmButton = null;
    let noHistory = false;

    while (Date.now() - start < 20000) {

        const pageText = (
            document.body.innerText || ""
        ).replace(/\s+/g, " ").toLowerCase();

        if (pageText.includes("нет выбранных действий")) {
            noHistory = true;

            const buttons = Array.from(document.querySelectorAll(
                'button, [role="button"]'
            ));

            confirmButton = buttons.find(button => {
                const text = (
                    button.innerText || button.textContent || ""
                ).replace(/\s+/g, " ").trim().toLowerCase();

                return ["закрыть", "ок"].includes(text) &&
                    button.getClientRects().length > 0 &&
                    !button.disabled;
            });

            if (confirmButton) {
                break;
            }
        } else {
            const dialogs = Array.from(document.querySelectorAll(
                '[role="dialog"], [aria-modal="true"]'
            ));

            for (const dialog of dialogs) {

                const buttons = Array.from(dialog.querySelectorAll(
                    'button, [role="button"]'
                ));

                confirmButton = buttons.find(button =>
                    (button.innerText || button.textContent || "")
                        .replace(/\s+/g, " ").trim() === "Удалить" &&
                    button.getClientRects().length > 0 &&
                    !button.disabled
                );

                if (confirmButton) {
                    break;
                }
            }

            if (confirmButton) {
                break;
            }
        }

        await wait(300);
    }

    if (!confirmButton) {
        alert("Не найдена кнопка подтверждения или закрытия окна");
        return;
    }

    // 4. Если истории нет — закрываем сообщение и вкладку
    if (noHistory) {
        confirmButton.click();

        await wait(700);

        chrome.runtime.sendMessage({
            action: "closeCurrentTab"
        });

        return;
    }

    // 5. История есть — подтверждаем удаление
    confirmButton.click();

    // 6. Ждём завершения удаления
    const successStart = Date.now();
    let okButton = null;

    while (Date.now() - successStart < 20000) {

        const dialogs = Array.from(document.querySelectorAll(
            '[role="dialog"], [aria-modal="true"]'
        ));

        for (const dialog of dialogs) {

            const text = (
                dialog.innerText || ""
            ).replace(/\s+/g, " ").toLowerCase();

            if (!text.includes("удаление завершено")) {
                continue;
            }

            const buttons = Array.from(dialog.querySelectorAll(
                'button, [role="button"]'
            ));

            okButton = buttons.find(button =>
                ["ок", "закрыть"].includes(
                    (button.innerText || button.textContent || "")
                        .replace(/\s+/g, " ").trim().toLowerCase()
                ) &&
                button.getClientRects().length > 0 &&
                !button.disabled
            );

            if (okButton) {
                break;
            }
        }

        if (okButton) {
            break;
        }

        await wait(300);
    }

    if (!okButton) {
        alert("Удаление завершено, но кнопка «ОК» не найдена");
        return;
    }

    okButton.click();

    await wait(700);

    chrome.runtime.sendMessage({
        action: "closeCurrentTab"
    });
}

async function waitForText(texts, timeout) {

    const start = Date.now();

    while (Date.now() - start < timeout) {

        const elements = Array.from(document.querySelectorAll(
            'button, [role="button"], [role="menuitem"]'
        ));

        const target = elements.find(element => {
            const text = (element.innerText || element.textContent || "")
                .replace(/\s+/g, " ")
                .trim();

            return texts.includes(text) &&
                element.getClientRects().length > 0 &&
                !element.disabled;
        });

        if (target) {
            return target;
        }

        await wait(300);
    }

    return null;
}
