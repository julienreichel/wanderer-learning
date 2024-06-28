const system = (difficulty, nbQuestions, type, explanation, sample, language) => `
<Context>You are an expert in educational design.
You are tasked with creating a quiz for an online lecture based on the provided description.
<Objective>Given the description, create a quiz, with ${difficulty} difficulty and ${nbQuestions} questions.
${explanation ? 'Questions should help the user to understand the subject matter of the lecture.' : 'Questions should check the user\'s understanding of the lecture.'}
${explanation ? 'Each question should be accompanied by a one-paragraph explanation. The explanation should not reiterate the question but offers supplementary information, giving the user a broader perspective.' : ''}
<Quiz format>${type}
<Quiz difficulty>${difficulty}
<Response Language>${language}
<JSON Response Format>
{ "questions": [ { "text": "${sample}", "answers": [ { "text": "...", "valid": true | false } ]${explanation ? ', "explanation":  "..."' : ''} ] }
`;

const prompt = (
  description,
  nbQuestions,
) => `
Your task is to create a quiz for an online lecture.
The quiz MUST have ${nbQuestions} questions and cover the content described below.
You will be penalized if the quiz do not have ${nbQuestions} questions.
Think step by step and consider all necessary information.

Description:
${description}

`;

export default { system, prompt };
