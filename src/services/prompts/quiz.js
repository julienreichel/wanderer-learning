const system = (difficulty, nbQuestions, type, explanation, language) => {
  const difficultyExplanation = [
    "novice: Recognizes and recalls basic concepts and terminology.",
    "beginner: Explains fundamental concepts and describes simple applications.",
    "intermediate: Understands and explains the impact of various conditions on the core concepts and applies them independently.",
    "advanced: Analyzes complex scenarios, understands nuanced aspects, and explores advanced scenario.",
    "expert: Synthesizes knowledge to explain complex phenomena which have not been explicitly taught.",
  ][difficulty - 1];
  const difficultyLevel = [
    "novice",
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ][difficulty - 1];

  const sample = {
    truefalse: "The sky is blue.",
    choice: "What is the color of the sky?",
    checkbox: "...? (select all that apply)",
    mythfact: "The sky can be purple.",
    missingword: "The ____ is blue.",
    finishsentence: "The sky is ____.",
  }[type];

  const format = {
    truefalse: "True or False",
    choice: "Multiple choices answers, with one valid answer",
    checkbox: "Checkboxes wiht 5 answers, with multiple valid answers",
    mythfact: "Myth or Fact",
    missingword: "Sentence with ONE missing word",
    finishsentence:
      "Each question is structured such that it starts with a partial sentence, and then three different answer options are provided as possible endings to that sentence",
  }[type];

  return `
<Context>
You are an expert in educational design.
You are tasked with creating a quiz for an online lecture based on the provided description.
<Objective>
Given the description, create a quiz, with ${difficultyLevel} level and ${nbQuestions} questions.
${explanation ? "Questions should help the user to understand the subject matter of the lecture." : "Questions should check the user's understanding of the lecture."}
${explanation ? "Each question should be accompanied by a one-paragraph explanation. The explanation should not reiterate the question but offers supplementary information, giving the user a broader perspective." : ""}
For mathematical formulas, use Katex format using $$ as delimiter (i.e. $$\frac{1}{}$$).
<Quiz format>
${format}
<Quiz level>
${difficultyExplanation}
<Response Language>
${language}
<JSON Response Format>
{ "questions": [ { "text": "${sample}", "answers": [ { "text": "...", "valid": true | false } ], level: "${difficultyLevel}", ${explanation ? ', "explanation":  "..."' : ""} ] }
`;
};

const prompt = (description, nbQuestions) => `
Your task is to create a quiz for an online lecture.
The quiz MUST have ${nbQuestions} questions and cover the content described below.
You will be penalized if the quiz do not have ${nbQuestions} questions.
Think step by step and consider all necessary information.

Description:
${description}

`;

export default { system, prompt };
