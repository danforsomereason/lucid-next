'use client'

import { useState } from "react";
import { NEW_MODULE, NEW_QUIZ_QUESTION } from "@/constants";
import { ModuleDef, QuestionDef } from "@/types";
import CreateCourseConsumer from "@/components/CreateCourseConsumer";
import {
  CourseCreatorValue,
  CourseCreatorContext,
} from "@/context/courseCreator";

export default function CoursesCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState<ModuleDef[]>([NEW_MODULE]);
  const [quizQuestions, setQuizQuestions] = useState<QuestionDef[]>([]);

  function updateTitle(value: string) {
    setTitle(value);
  }

  function updateDescription(value: string) {
    setDescription(value);
  }

  function addModule() {
    setModules((prev) => {
      return [...prev, NEW_MODULE];
    });
  }

  function addQuestion() {
    setQuizQuestions((prev) => {
      return [...prev, NEW_QUIZ_QUESTION];
    });
  }

  function updateModule<K extends keyof ModuleDef>(
    key: K,
    index: number,
    value: ModuleDef[K]
  ) {
    setModules((prev) => {
      return prev.map((module, moduleIndex) => {
        if (index !== moduleIndex) {
          return module;
        }
        const newModule: ModuleDef = {
          ...module,
          [key]: value,
        };
        return newModule;
      });
    });
  }

  function updateQuestion<K extends keyof QuestionDef>(
    key: K,
    index: number,
    value: QuestionDef[K]
  ) {
    setQuizQuestions((prev) => {
      return prev.map((question, innerQuestionIndex) => {
        if (index !== innerQuestionIndex) {
          return question;
        }

        const newQuestion = {
          ...question,
          [key]: value,
        };

        return newQuestion;
      });
    });
  }

  function removeQuestion(questionIndex: number) {
    const newQuestions = quizQuestions.filter((question, innerIndex) => {
      return innerIndex !== questionIndex;
    });
    setQuizQuestions(newQuestions);
  }

  function addOption(questionIndex: number) {
    setQuizQuestions((prev) => {
      return prev.map((question, innerQuestionIndex) => {
        if (questionIndex !== innerQuestionIndex) {
          return question;
        }
        const newOptions = [...question.options, ""];

        const newQuestion = {
          ...question,
          options: newOptions,
        };

        return newQuestion;
      });
    });
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    optionValue: string
  ) {
    setQuizQuestions((previousQuestions) => {
      const newQuestions = previousQuestions.map(
        (question, innerQuestionIndex) => {
          if (questionIndex !== innerQuestionIndex) {
            return question;
          }
          const newOptions = question.options.map(
            (option, innerOptionIndex) => {
              if (innerOptionIndex !== optionIndex) {
                return option;
              }
              return optionValue;
            }
          );
          const newQuestion = { ...question, options: newOptions };
          return newQuestion;
        }
      );
      return newQuestions;
    });
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setQuizQuestions((prev) => {
      return prev.map((question, innerQuestionIndex) => {
        if (questionIndex !== innerQuestionIndex) {
          return question;
        }

        const newOptions = question.options.filter(
          (option, innerOptionIndex) => {
            return innerOptionIndex !== optionIndex;
          }
        );
        const newQuestion = {
          ...question,
          options: newOptions,
        };
        return newQuestion;
      });
    });
  }

  function clearForm() {
    setModules([NEW_MODULE]);
    setQuizQuestions([]);
  }

  const courseCreatorValue: CourseCreatorValue = {
    modules,
    quizQuestions,
    title,
    description,
    updateTitle,
    updateDescription,
    addModule,
    updateModule,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    clearForm,
  };

  return (
    <CourseCreatorContext value={courseCreatorValue}>
      <CreateCourseConsumer />
    </CourseCreatorContext>
  );
}