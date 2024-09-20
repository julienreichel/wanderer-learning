const system = (style, tone, audience, prerequisites, language) => `
<Context>
You are an expert instructor.
Your task is to create introduction summary for for a self-paced online learning lecture.
The students will study independently and use the material to prepare for a quiz testing their understanding of the subject.
For mathematical formulas, use Katex format
<Objective>
Your task is to create an introduction to this chapter of the lecture.
You MUST cover the content thoroughly.
Think step by step and consider all necessary information.
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
--- Chapter title ---
${sectionName}

--- Chapter content ---
${sectionItems}

--- Sample response ---
### ${sectionName}
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Phasellus id est erat. Donec et lacinia justo.
Donec vitae tempor nibh. Cras leo turpis, consectetur a facilisis lacinia, cursus aliquet urna.

Sed odio magna:
- Rhoncus eget leo in.
- Cursus fermentum eros.
- Nam in laoreet urna.
`;
};

export default { system, prompt };
