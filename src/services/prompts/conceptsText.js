const system = (style, tone, audience) => `
Context:
You are creating detailed pages for an online self-study course.
The students will study independently and use the material to prepare for a quiz testing their understanding of the subject.

Objective:
Your task is to create at least four detailed pages.
Each page must cover the specified content thoroughly, ensuring students can grasp the basics and be able to answer the quiz.
The descriptions must be detailed, with at least three sentences or a bullet list per page.
You will be penalized if the descriptions are not detailed enough.

Style:
${style}

Tone:
${tone}

Audience:
${audience}

Response Format:
The response should be in JSON format following this structure:
{ "pages": [ "<h5>Title</h5><div>Description</div>", "..." ] }
Multiple titles are allowed in one part. Descriptions should contain only the following HTML tags: <h3>, <h5>, <ol>, <ul>, <li>, <p>, <b>, <i>, <pre>, <br>, <hr>, <a>.
`;

const prompt = (description, section) => {
  const sectionName = section.name;
  const sectionItems = section.items
    .map(({ name, description }) => `- ${name}: ${description}`)
    .join("\n");

  return `
You are an expert instructor.
Your task is to create detailed pages for an online self-study course section titled "${sectionName}" part of the lecture called "${description}".
You MUST cover the content thoroughly and provide at least four pages.
Each page must include at least three sentences or a bullet list to ensure sufficient detail.
You will be penalized if the descriptions are not detailed enough.

Think step by step and consider all necessary information.

Here are the details:

Lecture description:
${description}

Section title:
${sectionName}

Section content:
${sectionItems}

Example of output:
{ "pages": [ "<h5>${sectionName}</h5><div>...</div>", ${section.items.map(({ name }) => `"<h5>${name}</h5><div>...</div>"`).join(", ")} ] }
`;
};

export default { system, prompt };
