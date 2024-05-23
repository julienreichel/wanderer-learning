import { inject } from "vue";
import { useI18n } from 'vue-i18n';

export function useChecks() {

  const { storage: storageService } = inject("services");
  const { t } = useI18n();

  const checkPart = async (part) => {
    if (part.type === "quiz") {

      if (part.questions.length === 0) {
        throw { message: t("quiz.json.quiz_no_questions") };
      }
      part.questions.forEach((question) => {
        if (question.answers.length === 0) {
          throw { message: t("quiz.json.quiz_no_answers") };
        }

        // check that at least one answer is valid
        if (question.type !== "feedback" && question.answers.filter((a) => a.valid).length === 0) {
          throw { message: t("quiz.json.quiz_no_valid_answers") };
        }
      });

      // make sure all questions have an id, otherwise generate one
      // make sure all id are unique, if not, uptade them
      let ids = new Map();
      part.questions.forEach((question) => {
        if (!question.id || ids.has(question.id)) {
          question.id = uid();
        }
        ids.set(question.id, true);
      });
    }

    if (part.type === "img") {
      if (part.src.startsWith("http")) {
        part.url = part.src;
      } else if (!part.url) {
        part.url = await storageService.resolveUrl(part.src);
      }
    }
    return part;
  }

  return { checkPart }
}
