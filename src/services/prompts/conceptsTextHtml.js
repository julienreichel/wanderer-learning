const system = (style, tone, audience, prerequisites, language) => `
<Context>
You are creating detailed page for an online self-study lecture.
The student as already read the introduction shown bellow, do not repeat it.
The students will study independently and use the material to prepare for a quiz testing their understanding of the subject.
<Objective>
Your task is to create a lecture section, it must cover the specified content thoroughly, ensuring students can grasp the basics and be able to answer a quiz later.
When appropriate, add examples and references to public matherial.
For mathematical formulas, use Katex format
You will be penalized if the descriptions are not detailed enough.
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

const prompt = (section, item, introText) => {
  const sectionName = section.name;

  const activeSectionName = item.name;
  const activeSectionDescription = item.description;

  return `
You are an expert instructor.
Your task is to create detailed page for an online self-study lecture section titled "${activeSectionName}" part of the chapter titled "${sectionName}".
You MUST cover the content thoroughly and not repeat the introduction text.
You will be penalized if the descriptions are not detailed enough.

Think step by step and consider all necessary information.

Write the lecture section describing in details the "${activeSectionName}" part with the following description:
"${activeSectionDescription}".

Start the response by:
### ${activeSectionName}

---------------- Introduction ----------------
${introText}
`;
};

export default { system, prompt };
