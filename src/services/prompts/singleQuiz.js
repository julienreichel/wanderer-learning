const system = (tone, language, difficulty) => {
  const difficultyExplanation = [
    "novice: Recognizes and recalls basic concepts and terminology.",
    "beginner: Explains fundamental concepts and describes simple applications.",
    "intermediate: Understands and explains the impact of various conditions on the core concepts and applies them independently.",
    "advanced: Analyzes complex scenarios, understands nuanced aspects, and explores advanced phenomena.",
    "expert: Synthesizes knowledge to explain complex phenomena and contributes to the field through original research.",
  ][difficulty - 1];
  const difficultyLevel = [
    "novice",
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ][difficulty - 1];

  const quizTypes = {
    tf: " true/false choice (type=radio)",
    mf: " myth/fact choice (type=radio)",
    c3: " multiple-choice questions with 3 choices (type=radio)",
    c5: " multiple-choice questions with 5 choices (type=radio)",
    s4: " sentences with a choice of various 4 possible endings (type=radio)",
    m4: " sentence with a choice of 4 missing words. (type=radio)",
    x2: " checkbox with 5 proposals and at elast 2 correct answers (type=checkbox)",
    x5: " checkbox with 5 proposals and 0 to 5 correct answers (type=checkbox)",
    s1: " sentence with one and only one missing word (type=word)",
    q1: " sentence with a 1 to 3 words short answer, provide mulitple valid answers to the question (type=shorttext)",
  };
  let quizes = [];
  if (difficulty === 1) {
    quizes.push(5 + quizTypes.tf);
    quizes.push(5 + quizTypes.mf);
  } else if (difficulty === 2) {
    quizes.push(2 + quizTypes.tf);
    quizes.push(4 + quizTypes.c3);
    quizes.push(4 + quizTypes.s4);
  } else if (difficulty === 3) {
    quizes.push(3 + quizTypes.s4);
    quizes.push(4 + quizTypes.c5);
    quizes.push(3 + quizTypes.x2);
  } else if (difficulty === 4) {
    quizes.push(5 + quizTypes.x5);
    quizes.push(5 + quizTypes.s1);
  } else if (difficulty === 5) {
    quizes.push(10 + quizTypes.q1);
  }

  return `
<Context>
You are an expert in educational design.
You are tasked with creating a final quiz for an online lecture based on key concepts, learning objective and a table of content.
The purpose of the quiz with ${difficultyLevel} level is to eveluate if the user are able to perform the learning objectives.
<Objective>
Given the lecture description, the key concepts, the learning objectives and the table of content, create a quiz covering the lecture.
The quiz should encompass 10 questions in total distributed among the following types:
- ${quizes.join("\n- ")}
Each question should be accompanied by a one-paragraph explanation with at least 3 sentences.
The explanation should not reiterate the question but offers supplementary information, giving the user a broader perspective.
For mathematical formulas, use Katex format using $$ as delimiter (i.e. $$\frac{1}{}$$).
<Tone>
${tone}
<Quiz level>
${difficultyExplanation}
<Response Language>
${language}
<JSON Response Format>
{
  "questions": [ {
    "type": "radio" | "word" | "checkbox",
    "text": "...",
    "answers": [ { "text": "...", "valid": true | false } ],
    "level": "novice" | "beginner" | "intermediate" | "advanced",
    "explanations":  "..."
  }, ...]
}
`;
};

const prompt = (sectionName, sectionContent) => `
Your task is to create a final quiz for an online lecture.
The quiz MUST have 10 questions and cover the content provided.
You will be penalized if the quiz do not have 10 questions.
Think step by step and consider all necessary information.

---------------- Section title ----------------
${sectionName}

---------------- Section content ----------------
${sectionContent}

`;

export default { system, prompt };
