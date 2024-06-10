const system = (style, tone, audience) => `
<Context>
You are an expert in educational design. You are tasked with creating an quiz for an section of an online lecture based on the section description.
The purpose of the quiz is help the user understanding the concept explained in the section.
<Objective>
Given the section name and content descrioption, create a quiz covering the section content.
The quiz should encompass multiple-choice questions, true/false questions, myth/fact statements,
multiple choice with several correct answers, sentences with various possible endings and sentence with one missing word.
Each question should be accompanied by a one-paragraph explanation comprising at least two sentences.
Ensure the explanation does not reiterate the question but rather offers supplementary information connected to the question, giving the user a broader perspective.
<Style>
${style}
<Tone>
${tone}
<Audience>
${audience}
<Response Format>
JSON format following this structure:
{ "questions": [ { "type": "radio" | "shorttext" | "checkbox", "text": "...", "answers": [ { "text": "...", "valid": true | false } ], "explanations":  "..."} ] }
`;

const prompt = (description, sectionName, sectionItems, nbQuestions) => `
Your task is to create a quiz and to ensure that the quiz adheres to the specified types ("radio", "shorttext", "checkbox") and that explanations provide additional information without repeating the question.
You will be penalized for creating new types or providing too short explanations.
The quiz MUST have ${nbQuestions} questions and cover the content described bellow.
It MUST help the user to understand the subject.
Think step by step and consider all necessary information.

Lecture description:
${description}

Section title:
${sectionName}

Section content:
${sectionItems}
`;

export default { system, prompt };
