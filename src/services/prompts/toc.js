const system = (
  style,
  tone,
  audience,
  prerequisites,
  tocList,
  language,
  concepts
) => `
<Context>
You are an expert in educational design. You are tasked with designing the table of contents for an online lecture.
<Objective>
Given the lecture description, the key concepts and the learning objectives, create a table of contents for the lecture.
There should be between 3 to 5 sections. Each section should contain 3 to 5 items.
Each section should cover a specific objective. Mutliple sections can cover the same objective with different levels of difficulty.
For each section output the objective covered by the section and the level of difficulty.
<Style>
${style}
<Tone>
${tone}
<Audience>
${audience}
${prerequisites.length ? "<Prerequisites>\nStudents have already completed the following prerequisite lecture:\n" + prerequisites.join("\n") : ""}
${tocList ? "<Prerequisites>\nThe following sections have already be generated, do not include them in the response:\n" + tocList : ""}
<Response Language>
${language}
<JSON Response Format>
{
  "sections": [{
    "name": "...",
    "items": [{"name": "...", "description": "..."}],
    "level": "novice|beginner|intermediate|advanced|expert",
    "concept": "${concepts.join('|')}"
  }, ...]
}
`;

const prompt = (description, conceptsList, objectivesList) => `
Your task is to create the table of contents for an online lecture.
The sections MUST be derived from the lecture description, the key concepts and learning outcomes provided.
There should be between 3 to 5 sections, and each section should contain 3 to 5 items.
You will be penalized for not following the given format.
Think step by step and consider all necessary information.
Here are the details:

---------------- Key concepts ----------------
${conceptsList}

---------------- Learning outcomes ----------------
${objectivesList}

---------------- Lecture description ----------------
${description}
`;

export default { system, prompt };
