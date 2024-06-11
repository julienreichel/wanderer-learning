// This is just an example,
// so you can safely delete all default props below

export default {
  error: {
    form: {
      no_empty_text: "Please type something",
      save_error: "Something went wrong",
    },
  },
  generic: {
    form: {
      submit: "Submit",
      saved: "Saved",
      confirm_delete_title: "Confirm Delete",
      cancel: "Cancel",
      apply: "apply",
    },
    app_name: "Wanderer Learing",
    sign_out: "Sign Out",
    sign_in: "Sign In",
    welcome: "Welcome",
    edit: {
      json: "Edit JSON",
      text: "Edit Text",
      invalid_json: "Invalid JSON",
    },
  },
  quiz: {
    form: {
      title: "Quiz Title",
      confirm_delete_question: "Do you really want to delete this question ?",
    },
    question: {
      type: {
        shorttext: "Short Text",
        longtext: "Long Text",
        radio: "Multiple Choices",
        checkbox: "Check boxes",
        feedback: "Feedback",
      },
      explanation: "Provide an explanation",
      valid_answers: "Valid answer(s): ",
    },
    json: {
      no_questions: "A quiz must have at least one question",
      quiz_no_answers: "A question must have at least one answer",
      quiz_no_valid_answers: "A question must have at least one valid answer",
    },
    feedback: {
      type: {
        roti: "ROTI",
        difficulty: "Difficulty",
        stars: "Stars",
        text: "Free Text",
      },
      question: {
        roti: "What is your Return on Time Invested (ROTI) ?",
        difficulty: "How challenging did you find this lecture ?",
        stars: "How likely are you to recommend this lecture to others ?",
        text: "Do you have any feedback ?",
      },
      tooltips: {
        roti: {
          1: "Didn’t justify the time spent",
          2: "I gained something",
          3: "I gained enough to justify the time spent",
          4: "I gained more than the time spent",
          5: "This was really worth the time invested",
        },
        difficulty: {
          1: "Too easy",
          2: "Easy",
          3: "Average",
          4: "Hard",
          5: "Too hard",
        },
      },
    },
  },
  course: {
    list: "Courses",
    form: {
      add: "New course",
      title: "Course Title",
      confirm_delete_course: "Do you really want to delete this course ?",
    },
  },
  concept: {
    list: "Concepts",
    form: {
      add: "New concept",
      title: "Concept Title",
      duplicate: "Concept already exists",
      confirm_delete_concept: "Do you really want to delete this concept ?",
      no_results: "No results found",
    },
  },
  step: {
    form: {
      add: {
        quiz: "New quiz",
        step: "New Step",
      },
      quiz: "Quiz",
      step: "Step",
      title: "Step Title",
      confirm_delete_step: "Do you really want to delete this step ?",
    },
  },

  lecture: {
    form: {
      add: "New lecture",
      title: "Lecture Title",
      confirm_delete_lecture: "Do you really want to delete this lecture ?",
    },
    step: {
      not_completed: "Lecture step not completed, no result recorded",
    },
  },
  parts: {
    form: {
      add: {
        text: "New text",
        img: "New image",
        video: "New video",
        iframe: "New iframe",
      },
      text: "Text",
      img: "Image",
      video: "Video",
    },
  },
  reporting: {
    list: "Reporting",
    graphs: {
      time_distribution: {
        labels: {
          too_short: "Less than 5 min",
          good_time: "Between 5 and 10 min",
          long_time: "Between 10 and 15 min",
          too_long: "More than 15 min",
        },
      },
    },
  },
  wizard: {
    lecture: {
      title: "Lecture Description",
      description: "Descire the content of the lecture",
      label: "Description",
      style: "Style",
      audience: "Audience",
      tone: "Tone",
      model: "Model",
      advanced: "Advanced"
    },
    titleKeyConceptsObjectives: {
      title: "Concepts",
      name: "Title",
      concepts: "Concepts",
      objectives: "Learning Objectives",
      lectureTitle: "Lecture Title",
      keyConcepts: "Key Concepts",
      conceptName: "Concept Name",
      conceptDescription: "Concept Description",
      addConcept: "Add Concept",
      learningObjectives: "Learning Objectives",
      learningObjective: "Learning Objective",
      addObjective: "Add Objective",
    },
    tableOfContent: {
      title: "Table of Content",
      description: "Edit the Table of Content",
      stepName: "Step Title",
      stepParts: "Items",
      partName: "Subject",
      partDescription: "Description",
      addPart: "Add Part",
      addStep: "Add Step",
    },
    generating: {
      title: "Creating lecture",
      create: "Creating lecture",
      connect: "Creating connection step",
      concept: "Creating concepts steps: {concept}",
      practice: "Creating final quiz",
      conclusion: "Creating conclusion step",
      finished: "Finished",
      theory: "Theory",
      quiz: "Quiz",
    },
    common: {
      next: "Next",
      back: "Back",
      finish: "Finish",
      openLecture: "Open Lecture",
    },
  },
};
