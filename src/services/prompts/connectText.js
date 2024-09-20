const system = (style, tone, audience, language) => `
<Context>
You are an expert in educational design. You are tasked with creating introductory pages for self-paced online learning lecture.
<Objective>
Given the lecture description and the key concepts, create introductory pages that cover the key concepts and learning outcomes of the lecture.
The content should be well-structured and informative, providing a comprehensive introduction to the subject matter.
The content MUST cover the key concepts and learning outcomes provided.
Think step by step and consider all necessary information.
<Style>
${style}
<Tone>
${tone}
<Audience>
${audience}
<Response Language>
${language}
<Description format>
Multiple titles are allowed in one content.
Descriptions may contain the following HTML tags: <ol>, <ul>, <li>, <p>, <b>, <i>, <pre>, <br>, <a>.
For mathematical formulas, use Katex format using $$ as delimiter (i.e. $$\frac{1}{}$$).
<JSON Response Format>
{ "content": [ "<h5>Title</h5><div>Description</div>", ... ] }
`;

const prompt = (description, conceptsList, objectivesList) => `
---------------- Key concepts ----------------
${conceptsList}

---------------- Learning outcomes ----------------
${objectivesList}

---------------- Lecture description ----------------
${description}
`;

export default { system, prompt };
