const system = (style, tone, audience, language, level, concepts) => {
  const difficultyExplanation = [
    "novice: Recognizes and recalls basic concepts and terminology.",
    "beginner: Explains fundamental concepts and describes simple applications.",
    "intermediate: Understands and explains the impact of various conditions on the core concepts and applies them independently.",
    "advanced: Analyzes complex scenarios, understands nuanced aspects, and explores advanced phenomena.",
    "expert: Synthesizes knowledge to explain complex phenomena and contributes to the field through original research.",
  ][level - 1];
  const difficultyLevel = [
    "novice",
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ][level - 1];

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
    q1: " sentence with a 1 to 3 words short answer, provide mulitple valid answers to the question (type=shorttext)"
  };
  let quizes = [];
  if (level === 1) {
    quizes.push(10 + quizTypes.tf);
    quizes.push(10 + quizTypes.mf);
  } else if (level === 2) {
    quizes.push(3 + quizTypes.tf);
    quizes.push(3 + quizTypes.mf);
    quizes.push(7 + quizTypes.c3);
    quizes.push(7 + quizTypes.s4);
  } else if (level === 3) {
    quizes.push(5 + quizTypes.s4);
    quizes.push(10 + quizTypes.c5);
    quizes.push(5 + quizTypes.x2);
  } else if (level === 4) {
    quizes.push(10 + quizTypes.x5);
    quizes.push(10 + quizTypes.s1);
  } else if (level === 5) {
    quizes.push(20 + quizTypes.q1);
  }

  return `
<Context>
You are an expert in educational design.
You are tasked with creating a final quiz for an online lecture based on key concepts, learning objective and a table of content.
The purpose of the quiz with ${difficultyLevel} level is to eveluate if the user are able to perform the learning objectives.
<Objective>
Given the lecture description, the key concepts, the learning objectives and the table of content, create a quiz covering the lecture.
The quiz should encompass 20 questions in total distributed among the following types:
${quizes.join('\n')}
<Style>
${style}
<Audience>
${audience}
<Model>
- ${quizes.join('\n- ')}
Each question should be accompanied by a one-paragraph explanation with at least 3 sentences.
The explanation should not reiterate the question but offers supplementary information, giving the user a broader perspective.
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
    "concept": "${concepts.join('" | "')}",
    "explanations":  "..."
  }, ...]
}
`;
};

const prompt = (description, conceptsList, objectivesList, tocList) => `
Your task is to create a final quiz for an online lecture.
The quiz MUST have 20 questions and cover the lecture table of content and key concepts bellow.
It MUST check if the user is able to perform the learning objectives.
You will be penalized if the quiz do not have 20 questions.
Think step by step and consider all necessary information.

---------------- Key concepts ----------------
${conceptsList}

---------------- Learning outcomes ----------------
${objectivesList}

---------------- Table of Content ----------------
${tocList}

---------------- Lecture description ----------------
${description}

`;

export default { system, prompt };
