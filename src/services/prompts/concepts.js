const system = (
  style,
  tone,
  audience,
  prerequisites,
  conceptsStr,
  language,
) => `
<Context>
You are an expert in educational design. You are tasked with designing the first step of an online lecture.
<Objective>
Given the lecture description, create the lecture title, a list of key concepts covered by the lecture (1 to 3-word name, and a brief description),
and a list of Expected Learning Outcomes (each an action the student should be able to perform after completing the course).
<Style>
${style}
<Tone>
${tone}
<Audience>
${audience}
${prerequisites.length ? "<Prerequisites>\nStudent have already completed the following prerequisite courses:\n" + prerequisites.join("\n") : ""}
${conceptsStr ? "<Prerequisites>\nThe following concepts have already be generated, do not include them in the response:\n" + conceptsStr : ""}
<Response Language>
${language}
<JSON Response Format>
{ "title": "", "keyConcepts": [{"name": "...", "description": "..."}], "expectedLearningOutcomes": ["..."] }
`;

const prompt = (description) => `
Your task is to create the initial step of an online lecture.
Given the following lecture description, you MUST generate the lecture title,
create a list of key concepts covered by the lecture (each a 1 to 3-word name and a brief description),
and create a list of Expected Learning Outcomes (each an action the student should be able to perform after following the course).
Think step by step and consider all necessary information.

---------------- Lecture description ----------------
${description}
`;

export default { system, prompt };
