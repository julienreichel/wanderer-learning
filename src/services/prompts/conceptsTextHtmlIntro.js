const system = (style, tone, audience, prerequisites, language) => `
<Context>
You are creating detailed introduction for an online self-study lecture.
The students will study independently and use the material to prepare for a quiz testing their understanding of the subject.
<Objective>
Your task is to create an introduction to this chapter of the lecture.
For mathematical formulas, use Katex format
<Style>
${style}
<Tone>
${tone}
<Audience>
${audience}
${prerequisites.length ? "<Prerequisites>\nI have already completed the following prerequisite courses:\n" + prerequisites.join("\n") : ""}
<Response Language>
${language}
`;

const prompt = (section) => {
  const sectionName = section.name;
  const sectionItems = section.items
    .map(({ name, description }) => `- ${name}: ${description}`)
    .join("\n");

  return `
You are an expert instructor.
Your task is to create introduction summary for an online self-study course chapter titled "${sectionName}".
You MUST cover the content thoroughly.

Think step by step and consider all necessary information.

Here are the details:

Chapter title:
${sectionName}

Chapter content:
${sectionItems}

Start the response by:
### ${sectionName}
`;
};

export default { system, prompt };
