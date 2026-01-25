import { createContext, useContext } from "react";
import { ModuleDef, QuestionDef } from "@/types";

export interface CourseCreatorValue {
    modules: ModuleDef[];
    quizQuestions: QuestionDef[];
    title: string;
    description: string;
    updateTitle: (value: string) => void;
    updateDescription: (value: string) => void;
    addModule: () => void;
    updateModule: <K extends keyof ModuleDef>(
        key: K,
        index: number,
        value: ModuleDef[K]
    ) => void;
    addQuestion: () => void;
    updateQuestion: <K extends keyof QuestionDef>(
        key: K,
        index: number,
        value: QuestionDef[K]
    ) => void;
    removeQuestion: (questionIndex: number) => void;
    addOption: (questionIndex: number) => void;
    updateOption: (
        questionIndex: number,
        optionIndex: number,
        optionValue: string
    ) => void;
    removeOption: (questionIndex: number, optionIndex: number) => void;
    clearForm: () => void;
}

export const CourseCreatorContext = createContext<
    CourseCreatorValue | undefined
>(undefined);

export function useCourseCreator() {
    const courseCreator = useContext(CourseCreatorContext);
    if (!courseCreator) {
        throw new Error("useCourseCreator must be used inside a provider");
    }
    return courseCreator;
}