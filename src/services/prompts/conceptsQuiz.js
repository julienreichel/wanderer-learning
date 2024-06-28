const system = (style, tone, audience, language) => `
<Context>
You are an expert in educational design. You are tasked with creating an quiz for an section of an online lecture based on the section description.
The purpose of the quiz is help the user understanding the concepts explained in the section.
<Objective>
Given the section descrioption, create a quiz covering the section content.
The quiz should encompass
- multiple-choice questions
- true/false choice
- myth/fact choice
- multiple checkbox with several correct answers
- sentences with a choice of various possible endings
- sentence with a choice of missing words.
- sentence with one and only one missing word
Each question should be accompanied by a one-paragraph explanation comprising at least two sentences.
Ensure the explanation does not reiterate the question but rather offers supplementary information connected to the question, giving the user a broader perspective.
<Style>
${style}
<Tone>
${tone}
<Audience>
${audience}
<Response Language>
${language}
<JSON Response Format>
{ "questions": [ { "type": "radio" | "shorttext" | "checkbox", "text": "...", "answers": [ { "text": "...", "valid": true | false } ], "explanations":  "..."} ] }
`;

const prompt = (sectionName, sectionItems, nbQuestions) => `
Your task is to create a quiz with ${nbQuestions} questions based on the following section description.
The quiz MUST have ${nbQuestions} questions and cover the content described bellow.
Think step by step and consider all necessary information.

Section title:
${sectionName}

Section content:
${sectionItems}
`;

export default { system, prompt };
