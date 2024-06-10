const system = (style, tone, audience) => `
<Context>You are an expert in educational design.
You are tasked with creating a final quiz for an online lecture based on key concepts, learning objective and a table of content.
The purpose of the quiz is to eveluate if the user are able to perform the learing objectives.
<Objective>Given the lecture description, the key concepts, the learning objectives and the table of content,
create a quiz covering the lecture table of content.
The quiz should include multiple-choice questions, true/false questions, myth/fact, multiple choice with multiple valid answers, and sentence with missing words.
The quiz difficulty should be progressive, starting with easy questions and ending with more complex ones.
<Style>${style}
<Tone>${tone}
<Audience>${audience}
<Response Format>The response should be in JSON format following this structure:
{ "questions": [ { "type": "...", "text": "...", "answers": [ { "text": "...", "valid": true } ] ]}
Possible values for "type" and "valid" are:
type = "radio" | "shorttext" | "checkbox"
valid = true | false
answers should NOT inlcude prefix such as "A.", "B.", etc.
`;

const prompt = (description, conceptsList, objectivesList, tocList, nbQuestions) => `
Your task is to create a final quiz for an online lecture.
The quiz MUST have ${nbQuestions} questions and cover the lecture table of content and key concepts bellow.
It MUST check if the user is able to perform the learning objectives.
The questions must include multiple-choice questions, true/false questions, myth/fact, multiple choice with multiple valid answers, and sentence with missing words.
You will be penalized if it is not possible to check if the student cappable of performing the learning objectives based on the quiz results.
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
