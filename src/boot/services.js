import { boot } from "quasar/wrappers";
import ConceptService from "src/services/concept";
import CourseService from "src/services/course";
import LectureService from "src/services/lecture";
import LectureConceptService from "src/services/lecture-concept";
import LectureStepService from "src/services/lecture-step";
import StepReportingService from "src/services/step-reporting";
import CourseReportingService from "src/services/course-reporting";
import StorageService from "src/services/storage";

import AIService from "src/services/ai";

export default boot(({ app }) => {
  let cacheData = {
    single: {},
  };
  const concept = new ConceptService(cacheData);
  const course = new CourseService(cacheData);
  const lecture = new LectureService(cacheData);
  const lectureConcept = new LectureConceptService(cacheData);
  const lectureStep = new LectureStepService(cacheData);
  const stepReporting = new StepReportingService(cacheData);
  const courseReporting = new CourseReportingService(cacheData);
  const storage = new StorageService(cacheData);
  const ai = new AIService();

  app.provide("services", {
    lectureStep,
    concept,
    course,
    lecture,
    lectureConcept,
    stepReporting,
    courseReporting,
    storage,
    ai,
  });
});
