import type { ClientSchema } from "@aws-amplify/backend";
import { a, defineData, defineFunction, secret } from "@aws-amplify/backend";

const AIQueryHandler = defineFunction({
  entry: "./ai-query/ai-query.ts",
  timeoutSeconds: 60,
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    OPENAI_MAX_TOKEN: process.env.OPENAI_MAX_TOKEN || "50",
    OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE || "0.7",
  },
});

const schema = a.schema({
  ReportingResponse: a.customType({
    questionId: a.id(),
    valid: a.boolean(),
    feedback: a.string(),
    points: a.integer(),
    response: a.string(),
    type: a.string(),
    feedbackType: a.string(),
  }),

  ReportingPart: a.customType({
    time: a.integer(),
    responses: a.ref("ReportingResponse").array(),
  }),

  StepReporting: a
    .model({
      id: a.id().required(),
      createdAt: a.datetime(),
      owner: a.string(),
      lectureStepId: a.id().required(),
      lectureId: a.id().required(),
      reportings: a.ref("ReportingPart").array(),
    })
    .secondaryIndexes((index) => [
      index("owner").name("byOwner").sortKeys(["createdAt"]),
      index("lectureStepId").name("byLectureStep").sortKeys(["owner"]),
      index("lectureId").name("byLecture").sortKeys(["owner"]),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),

  QuestionAnswer: a.customType({
    text: a.string(),
    valid: a.boolean(),
  }),

  Option: a.customType({
    name: a.string(),
    value: a.string(),
  }),

  Question: a.customType({
    id: a.id().required(),
    type: a.string(),
    text: a.string(),
    explanations: a.string(),
    answers: a.ref("QuestionAnswer").array(),
    options: a.ref("Option").array(),
  }),

  LecturePart: a.customType({
    type: a.string(),
    text: a.string(),
    src: a.string(),
    questions: a.ref("Question").array(),
    options: a.ref("Option").array(),
  }),

  LectureStep: a
    .model({
      id: a.id().required(),
      type: a.string().required(),
      lectureId: a.id().required(),
      lecture: a.belongsTo("Lecture", "lectureId"),
      order: a.string(),
      title: a.string().required(),
      owner: a.string(),
      identityId: a.string(),
      conceptId: a.id(),
      concept: a.belongsTo("Concept", "conceptId"),
      parts: a.ref("LecturePart").array(),
    })
    .secondaryIndexes((index) => [
      index("lectureId").name("byLecture").sortKeys(["order"]),
      index("conceptId").name("byConcept"),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("admin"),
    ]),

  Lecture: a
    .model({
      id: a.id().required(),
      courseId: a.id().required(),
      title: a.string().required(),
      order: a.string(),
      owner: a.string(),
      course: a.belongsTo("Course", "courseId"),
      steps: a.hasMany("LectureStep", "lectureId"),
      concepts: a.hasMany("LectureConceptJoinTable", "lectureId"),
    })
    .secondaryIndexes((index) => [
      index("courseId").name("byCourse").sortKeys(["order"]),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("admin"),
    ]),

  Course: a
    .model({
      id: a.id().required(),
      title: a.string().required(),
      owner: a.string(),
      lectures: a.hasMany("Lecture", "courseId"),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("admin"),
    ]),

  Concept: a
    .model({
      id: a.id().required(),
      title: a.string().required(),
      description: a.string(),
      lectures: a.hasMany("LectureConceptJoinTable", "conceptId"),
      steps: a.hasMany("LectureStep", "conceptId"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.group("teacher"),
    ]),

  LectureConceptJoinTable: a
    .model({
      lectureId: a.id().required(),
      conceptId: a.id().required(),

      lecture: a.belongsTo("Lecture", "lectureId"),
      concept: a.belongsTo("Concept", "conceptId"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.group("teacher"),
    ]),

  AIMessage: a.customType({
    role: a.string(),
    content: a.string(),
  }),

  AIQuery: a
    .query()
    .arguments({
      system: a.string(),
      prompt: a.string(),
      messages: a.json(),
      token: a.integer(),
      format: a.string(),
    })
    // return type of the query
    .returns(a.string())
    // only allow signed-in users to call this API
    .authorization((allow) => [allow.group("admin"), allow.group("teacher")])
    .handler(a.handler.function(AIQueryHandler)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
