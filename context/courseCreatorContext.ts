import { createContext, useContext } from "react";
import { ModuleDef, QuestionDef } from "@/types";

export interface CourseCreatorValue {
    ceHours: string;
    description: string;
    maximumAttempts: string;
    modules: ModuleDef[];
    passingScore: string;
    quizQuestions: QuestionDef[];
    title: string;
    updateCeHours: (value: string) => void;
    updateDescription: (value: string) => void;
    updateMaximumAttempts: (value: string) => void;
    updateOption: (
        questionIndex: number,
        optionIndex: number,
        optionValue: string
    ) => void;
    updatePassingScore: (value: string) => void;
    updateQuestion: <K extends keyof QuestionDef>(
        key: K,
        index: number,
        value: QuestionDef[K]
    ) => void;
    updateTitle: (value: string) => void;
    addModule: () => void;
    updateModule: <K extends keyof ModuleDef>(
        key: K,
        index: number,
        value: ModuleDef[K]
    ) => void;
    removeModule: (moduleIndex: number) => void
    addQuestion: () => void;
    removeQuestion: (questionIndex: number) => void;
    addOption: (questionIndex: number) => void;
    removeOption: (questionIndex: number, optionIndex: number) => void;
    clearForm: () => void;
    submitCourse: () => Promise<void>
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