const system = (style, tone, audience, prerequisites) => `
Context:
You are creating detailed page for an online self-study course.
The students will study independently and use the material to prepare for a quiz testing their understanding of the subject.

Objective:
Your task is to create an HTML fragment, it must cover the specified content thoroughly, ensuring students can grasp the basics and be able to answer a quiz later.
You will be penalized if the descriptions are not detailed enough.


Style:
${style}

Tone:
${tone}

Audience:
${audience}
${prerequisites.length ? "\nPrerequisites:\nI have already completed the following prerequisite courses: " + prerequisites.join(", ") : ""}

Response Format:
The response should be in HTML format, using only the following HTML tags: <h5> <ol>, <ul>, <li>, <p>, <b>, <i>, <pre>, <br>, <hr>, <a>.
The link <a> can only be use to link public web pages.
`;

const prompt = (section) => {
  const sectionName = section.name;
  const sectionItems = section.items
    .map(({ name, description }) => `- ${name}: ${description}`)
    .join("\n");

  return `
You are an expert instructor.
Your task is to create introduction page for an online self-study course chapter titled "${sectionName}".
You MUST cover the content thoroughly.
You will be penalized if the descriptions are not detailed enough.

Think step by step and consider all necessary information.

Here are the details:

Section title:
${sectionName}

Section content:
${sectionItems}

Start the response by:
"<h5>${sectionName}</h5> ..."
`;
};

export default { system, prompt };
