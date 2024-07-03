const system = (style, tone, audience, prerequisites, language, concepts) => `
<Context>
You are an expert in educational design.
You are tasked with creating an initial quiz for an online lecture based on key concepts.
The purpose of the quiz is to connect the user with what they already know.
It should be possible to answer the questions for a user that has not followed the course yet.
<Objective>
Given the lecture description and the key concepts, create a quiz covering the lecture description and key concepts.
The quiz should encompass
- multiple-choice questions
- true/false choice
- myth/fact choice
- multiple checkbox with several correct answers
- sentences with a choice of various possible endings
Each question should be accompanied by a one-paragraph explanation.
The explanation should not reiterate the question but offers supplementary information, giving the user a broader perspective.
For each question indicate which concept is covered by the question.
For each question estimate the level of difficulty.
<Style>
${style}
<Tone>
${tone}
<Audience>
${audience}
${prerequisites.length ? "<Prerequisites>\nStudent have already completed the following prerequisite lecture:\n" + prerequisites.join("\n") : ""}
<Response Language>
${language}
<JSON Response Format>
{
  "questions": [{
    "type": "radio" | "checkbox",
    "text": "...",
    "answers": [ { "text": "...", "valid": true | false } ],
    "explanations":  "..."},
    "level": "novice|beginner|intermediate",
    "concept": "${concepts.join('|')}"
 }, ...]
}
`;

const prompt = (description, conceptsList, nbQuestions) => `
Your task is to create a quiz and to ensure that the quiz adheres to the specified types ("radio", "checkbox") and that explanations provide additional information without repeating the question.
You will be penalized for creating new types or providing too short explanations.
The quiz MUST have ${nbQuestions} questions and cover the lecture description and key concepts bellow.
It must be possible to answer the questions only based on general knowledge.
Think step by step and consider all necessary information.

---------------- Key concepts ----------------
${conceptsList}

---------------- Lecture description ----------------
${description}
`;

export default { system, prompt };
