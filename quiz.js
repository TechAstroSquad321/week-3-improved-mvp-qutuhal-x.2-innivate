// ===============================
// SIGNLEARN QUIZ
// ===============================

const questions = [

    {
        question: "Which sign represents the letter A?",
        answers: ["A", "B", "C", "D"],
        correct: "A"
    },

    {
        question: "Which sign language word means a greeting?",
        answers: ["Hello", "Sleep", "Run", "Book"],
        correct: "Hello"
    },

    {
        question: "Which of these is commonly used to say Thank You?",
        answers: ["🙏", "👋", "👍", "✌️"],
        correct: "🙏"
    },

    {
        question: "Which sign is commonly associated with Love?",
        answers: ["❤️", "📚", "🏠", "⭐"],
        correct: "❤️"
    },

    {
        question: "Why is learning sign language useful?",
        answers: [
            "To communicate with more people",
            "Only for games",
            "Only for school",
            "It has no use"
        ],
        correct: "To communicate with more people"
    }

];


// ===============================
// VARIABLES
// ===============================

let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;


// ===============================
// GET HTML ELEMENTS
// ===============================

const questionNumber =
    document.getElementById("questionNumber");

const scoreText =
    document.getElementById("score");

const questionText =
    document.getElementById("question");

const answerContainer =
    document.getElementById("answerContainer");

const nextButton =
    document.getElementById("nextButton");

const feedback =
    document.getElementById("feedback");

const quizProgress =
    document.getElementById("quizProgress");

const quizCard =
    document.querySelector(".quiz-section .quiz-card");

const resultCard =
    document.getElementById("resultCard");

const finalScore =
    document.getElementById("finalScore");

const resultMessage =
    document.getElementById("resultMessage");

const restartButton =
    document.getElementById("restartButton");


// ===============================
// LOAD QUESTION
// ===============================

function loadQuestion() {

    selectedAnswer = null;

    const current = questions[currentQuestion];

    questionNumber.textContent =
        `Question ${currentQuestion + 1} / ${questions.length}`;

    scoreText.textContent = score;

    questionText.textContent =
        current.question;

    feedback.textContent = "";

    nextButton.disabled = true;

    answerContainer.innerHTML = "";


    // Update progress bar

    const progress =
        ((currentQuestion + 1) / questions.length) * 100;

    quizProgress.style.width =
        progress + "%";


    // Create answer buttons

    current.answers.forEach(answer => {

        const button =
            document.createElement("button");

        button.className =
            "quiz-option";

        button.textContent =
            answer;

        button.addEventListener("click", () => {

            selectAnswer(button, answer);

        });

        answerContainer.appendChild(button);

    });

}


// ===============================
// SELECT ANSWER
// ===============================

function selectAnswer(button, answer) {

    if (selectedAnswer !== null) {
        return;
    }

    selectedAnswer = answer;

    const current =
        questions[currentQuestion];

    const allButtons =
        document.querySelectorAll(".quiz-option");


    // Disable all answers

    allButtons.forEach(btn => {
        btn.disabled = true;
    });


    // Check answer

    if (answer === current.correct) {

        button.classList.add("correct");

        feedback.textContent =
            "✅ Correct!";

        feedback.className =
            "quiz-feedback correct-text";

        score++;

        scoreText.textContent =
            score;

    } else {

        button.classList.add("wrong");

        feedback.textContent =
            `❌ Not quite. The correct answer is "${current.correct}".`;

        feedback.className =
            "quiz-feedback wrong-text";


        // Highlight correct answer

        allButtons.forEach(btn => {

            if (btn.textContent === current.correct) {

                btn.classList.add("correct");

            }

        });

    }

    nextButton.disabled = false;

}


// ===============================
// NEXT QUESTION
// ===============================

nextButton.addEventListener("click", () => {

    currentQuestion++;

    if (currentQuestion < questions.length) {

        loadQuestion();

    } else {

        showResult();

    }

});


// ===============================
// SHOW RESULT
// ===============================

function showResult() {

    quizCard.style.display = "none";

    resultCard.style.display = "block";

    finalScore.textContent =
        `${score} / ${questions.length}`;


    if (score === 5) {

        resultMessage.textContent =
            "🏆 Perfect score! Amazing work!";

    } else if (score >= 3) {

        resultMessage.textContent =
            "⭐ Great job! Keep practicing!";

    } else {

        resultMessage.textContent =
            "💪 Keep practicing and try again!";

    }

}


// ===============================
// RESTART
// ===============================

restartButton.addEventListener("click", () => {

    currentQuestion = 0;

    score = 0;

    quizCard.style.display = "block";

    resultCard.style.display = "none";

    loadQuestion();

});


// ===============================
// START QUIZ
// ===============================

loadQuestion();
