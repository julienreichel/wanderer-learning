import { boot } from "quasar/wrappers";
import ConceptService from "src/services/concept";
import CourseService from "src/services/course";
import LectureService from "src/services/lecture";
import LectureConceptService from "src/services/lecture-concept";
import LectureStepService from "src/services/lecture-step";
import StepReportingService from "src/services/step-reporting";
import StorageService from "src/services/storage";

import AIService from "src/services/ai";

export default boot(({ app }) => {
  const concept = new ConceptService();
  const course = new CourseService();
  const lecture = new LectureService();
  const lectureConcept = new LectureConceptService();
  const lectureStep = new LectureStepService();
  const stepReporting = new StepReportingService();
  const storage = new StorageService();
  const ai = new AIService();

  app.provide("services", {
    lectureStep,
    concept,
    course,
    lecture,
    lectureConcept,
    stepReporting,
    storage,
    ai,
  });
});
