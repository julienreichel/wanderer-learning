const system = (style, tone, audience) => `
<Context>You are an expert in educational design. You are tasked with designing the table of contents for an online lecture.
<Objective>Given the lecture description, the key concepts and the learning objectives, create a table of contents for the lecture.
There should be between 3 to 5 sections, and each section should contain 3 to 5 items.
<Style>${style}
<Tone>${tone}
<Audience>${audience}
<Response Format>JSON format following this example:
{ "sections": ["name": "...", "items": [{"name": "...", "description": "..."}]}] }
`;

const prompt = (description, conceptsList, objectivesList) => `
Your task is to create the table of contents for an online lecture. The sections MUST be derived from the lecture description,
the key concepts and learning outcomes provided. There should be between 3 to 5 sections, and each section should contain 3 to 5 items.
You will be penalized for not following the given style, tone, and format.
Think step by step and consider all necessary information.
Here are the details:

Lecture description:
${description}

Key concepts:
${conceptsList}

Learning outcomes:
${objectivesList}
`;

export default { system, prompt };
