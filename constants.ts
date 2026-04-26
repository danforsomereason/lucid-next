import { QuestionDef, ModuleDef } from "./types";

export const NEW_MODULE: ModuleDef = {
  heading: "",
  content: "",
  estimatedMinutes: 0,
};

export const NEW_QUIZ_QUESTION: QuestionDef = {
  questionText: "",
  questionType: "Multiple Choice",
  options: ["", ""],
  correctOptionOrder: 0,
  explanation: "",
};

export const SURVEY_QUESTIONS = [
  'This course met the objectives stated in the course description.',
  'After completing this course, how knowledgeable and/or equipped do you feel in this area?',
  'The course information was current and accurate.',
  'This course information was relevant to my profession.',
  'The references used in the development of this program included current literature and were aligned with best practices.',
  'The instructional methods were effective.',
  'The author/instructor was knowledgeable and presented the information clearly.',
  'The instructor was responsive and/or available to participants if needed.',
  'If you had any questions, did the administrator respond quickly and thoroughly?',
  'The registration process for this course was straightforward.',
  'The course technology was user-friendly.',
  'The total length of time to complete the course:',
  'Please provide any additional comments you may have regarding this course:'
]