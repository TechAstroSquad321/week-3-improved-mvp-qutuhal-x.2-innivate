function showLesson(type) {

    const title = document.getElementById("lessonTitle");
    const text = document.getElementById("lessonText");
    const content = document.getElementById("lessonContent");

    if (type === "alphabet") {

        title.textContent = "🔤 Alphabet";

        text.textContent =
            "Start learning the hand signs for the alphabet.";

        content.innerHTML = `
            <div class="lesson-box">
                <h3>A – Z</h3>
                <p>
                    Practice each letter slowly and
                    repeat it several times.
                </p>

                <div class="letter-grid">
                    ${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter =>
                        `<div class="letter-card">${letter}</div>`
                    ).join("")}
                </div>
            </div>
        `;

    }


    else if (type === "numbers") {

        title.textContent = "🔢 Numbers";

        text.textContent =
            "Practice basic numbers used in everyday communication.";

        content.innerHTML = `
            <div class="lesson-box">
                <h3>Numbers 1 – 10</h3>

                <div class="letter-grid">
                    ${[1,2,3,4,5,6,7,8,9,10].map(number =>
                        `<div class="letter-card">${number}</div>`
                    ).join("")}
                </div>
            </div>
        `;

    }


    else if (type === "common") {

        title.textContent = "👋 Common Signs";

        text.textContent =
            "Learn some useful everyday communication signs.";

        content.innerHTML = `
            <div class="lesson-box">

                <div class="sign-item">
                    <strong>👋 Hello</strong>
                    <p>A common greeting.</p>
                </div>

                <div class="sign-item">
                    <strong>🙏 Thank You</strong>
                    <p>A polite expression of thanks.</p>
                </div>

                <div class="sign-item">
                    <strong>❤️ Love</strong>
                    <p>Used to express affection or care.</p>
                </div>

            </div>
        `;

    }


    else if (type === "phrases") {

        title.textContent = "💬 Phrases";

        text.textContent =
            "Practice simple phrases for communication.";

        content.innerHTML = `
            <div class="lesson-box">

                <p>👋 Hello!</p>
                <p>🙏 Thank you.</p>
                <p>❓ How are you?</p>
                <p>😊 I am good.</p>

            </div>
        `;

    }

    document
        .getElementById("lessonArea")
        .scrollIntoView({
            behavior: "smooth"
        });
}
