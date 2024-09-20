const system = (style, tone, audience, prerequisites, language) => `
<Context>
You are creating detailed page for a self-paced online learning lecture.
The student as already read the introduction shown bellow, do not repeat it.
The students will study independently and use the material to prepare for a quiz testing their understanding of the subject.
<Objective>
Your task is to create a detailed page for a lecture section, it must cover the specified content thoroughly, ensuring students can grasp the basics and be able to answer a quiz later.
When appropriate, add examples and references to public matherial.
For mathematical formulas, use Katex format.
Avoid conclusion and summary, focus on the content.

You MUST cover the content thoroughly and not repeat the introduction text.
You will be penalized if the descriptions are not detailed enough.

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

const prompt = (section, item, introText) => {
  const sectionName = section.name;

  const activeSectionName = item.name;
  const activeSectionDescription = item.description;

  return `
---------------- Chapter title ----------------
${sectionName}.

---------------- Introduction ----------------
${introText}

---------------- Section title ----------------
${activeSectionName}

---------------- Section description ----------------
${activeSectionDescription}

---------------- Sample response ----------------
### ${activeSectionName}
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Phasellus id est erat. Donec et lacinia justo. Donec vitae tempor nibh. Cras leo turpis, consectetur a facilisis lacinia, cursus aliquet urna.

##### Lorem ipsum dolor
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Phasellus id est erat. Donec et lacinia justo. Donec vitae tempor nibh. Cras leo turpis, consectetur a facilisis lacinia, cursus aliquet urna.

Phasellus id est erat.
- Donec et lacinia justo.
- Donec vitae tempor nibh.
- Cras leo turpis, consectetur a facilisis lacinia, cursus aliquet urna.

##### Lorem ipsum dolor
[...]

##### Lorem ipsum dolor
[...]
`;
};

export default { system, prompt };
