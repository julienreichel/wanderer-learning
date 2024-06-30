const system = (style, tone, audience, language, level) => {

  const difficultyExplanation = [
    "novice: Recognizes and recalls basic concepts and terminology.",
    "beginner: Explains fundamental concepts and describes simple applications.",
    "intermediate: Understands and explains the impact of various conditions on the core concepts and applies them independently.",
    "advanced: Analyzes complex scenarios, understands nuanced aspects, and explores advanced phenomena.",
    "expert: Synthesizes knowledge to explain complex phenomena and contributes to the field through original research."
  ][level - 1];
  const difficultyLevel = [
    "novice",
    "beginner",
    "intermediate",
    "advanced",
    "expert"
  ][level - 1];

  return `
<Context>You are an expert in educational design.
You are tasked with creating a final quiz for an online lecture based on key concepts, learning objective and a table of content.
The purpose of the quiz with ${difficultyLevel} level is to eveluate if the user are able to perform the learning objectives.
<Objective>Given the lecture description, the key concepts, the learning objectives and the table of content, create a quiz covering the lecture.
The quiz should encompass at least
- 5 multiple-choice questions with 3 or 5 choices (type=radio)
- 2 true/false choice (type=radio)
- 2 myth/fact choice (type=radio)
- 5 checkbox with 5 proposals and several correct answers (type=checkbox)
- 2 sentences with a choice of various 4 possible endings (type=radio)
- 2 sentence with a choice of 4 missing words. (type=radio)
- 2 sentence with one and only one missing word (type=word)
<Tone>${tone}
<Quiz level>${difficultyExplanation}
<Response Language>${language}
<JSON Response Format>
{ "questions": [ { "type": "radio" | "word" | "checkbox", "text": "...", "answers": [ { "text": "...", "valid": true | false } ], level: "novice|beginner|intermediate|advanced" ] }
`
};

const prompt = (
  description,
  conceptsList,
  objectivesList,
  tocList,
) => `
Your task is to create a final quiz for an online lecture.
The quiz MUST have 20 questions and cover the lecture table of content and key concepts bellow.
It MUST check if the user is able to perform the learning objectives.
You will be penalized if the quiz do not have 20 questions.
Think step by step and consider all necessary information.

Lecture description:
${description}

Key concepts:
${conceptsList}

Learning objectives:
${objectivesList}

Table of Content:
${tocList}


`;

export default { system, prompt };
