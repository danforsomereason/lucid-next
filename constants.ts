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