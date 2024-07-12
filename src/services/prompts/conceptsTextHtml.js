const system = (style, tone, audience, prerequisites, language) => `
<Context>
You are creating detailed page for an online self-study course.
The students will study independently and use the material to prepare for a quiz testing their understanding of the subject.
<Objective>
Your task is to create an HTML fragment, it must cover the specified content thoroughly, ensuring students can grasp the basics and be able to answer a quiz later.
When appropriate, add examples and references to public matherial.
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
<HTML Response Format>
The response should be in HTML format, using only the following HTML tags: <h5> <ol>, <ul>, <li>, <p>, <b>, <i>, <pre>, <br>, <a>, <table>, <tr>, <td>.
The link <a> can only be use to link public web pages.
For mathematical formulas, use Katex format.
`;

const prompt = (section, item) => {
  const sectionName = section.name;
  const sectionItems = section.items
    .map(({ name, description }) => `- ${name}: ${description}`)
    .join("\n");

  const activeSectionName = item.name;
  const activeSectionDescription = item.description;

  return `
You are an expert instructor.
Your task is to create detailed page for an online self-study course section titled "${activeSectionName}" part of the chapter titled "${sectionName}".
You MUST cover the content thoroughly.
You will be penalized if the descriptions are not detailed enough.

Think step by step and consider all necessary information.

Here are the details:

Section title:
${sectionName}

Section content:
${sectionItems}

Write the HTML fragment describing ONLY the "${activeSectionName}" part with the description: "${activeSectionDescription}".

Start the response by:
"<h5>${activeSectionName}</h5> ..."

`;
};

export default { system, prompt };
