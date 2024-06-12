const system = (style, tone, audience) => `
<Context>You are an expert in educational design.
You are tasked with creating a final quiz for an online lecture based on key concepts, learning objective and a table of content.
The purpose of the quiz is to eveluate if the user are able to perform the learing objectives.
<Objective>Given the lecture description, the key concepts, the learning objectives and the table of content,create a quiz covering the lecture table of content.
The quiz should encompass
- multiple-choice questions
- true/false choice
- myth/fact choice
- multiple checkbox with several correct answers
- sentences with a choice of various possible endings
- sentence with a choice of missing words.
- sentence with one and only one missing word
The quiz difficulty should be progressive, starting with easy questions and ending with more complex ones.
<Style>${style}
<Tone>${tone}
<Audience>${audience}
<Response Format>
JSON format following this structure:
{ "questions": [ { "type": "radio" | "shorttext" | "checkbox", "text": "...", "answers": [ { "text": "...", "valid": true | false } ] ] }
`;

const prompt = (
  description,
  conceptsList,
  objectivesList,
  tocList,
  nbQuestions,
) => `
Your task is to create a final quiz for an online lecture.
The quiz MUST have ${nbQuestions} questions and cover the lecture table of content and key concepts bellow.
It MUST check if the user is able to perform the learning objectives.
You will be penalized if the quiz do not have ${nbQuestions} questions.
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
