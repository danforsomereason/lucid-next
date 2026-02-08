'use client'

import { useState } from "react";
import { NEW_MODULE, NEW_QUIZ_QUESTION } from "@/constants";
import { CreateCourseInput, createCourseInputSchema, ModuleDef, QuestionDef } from "@/types";
import CreateCourseConsumer from "@/components/CreateCourseConsumer";
import {
  CourseCreatorValue,
  CourseCreatorContext,
} from "@/context/courseCreator";
import axios from "axios";
import z, { ZodError } from "zod";

export default function CoursesCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState<ModuleDef[]>([NEW_MODULE]);
  const [quizQuestions, setQuizQuestions] = useState<QuestionDef[]>([NEW_QUIZ_QUESTION]);
  const [ceHours, setCeHours] = useState('');

  function updateTitle(value: string) {
    setTitle(value);
  }

  function updateDescription(value: string) {
    setDescription(value);
  }

  function updateCeHours(value: string) {
    setCeHours(value);
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

  function removeModule (moduleIndex: number) {
    const newModules = modules.filter((module, innerIndex) => {
      return innerIndex !== moduleIndex;
    });
    setModules(newModules);
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
    setTitle("");
    setDescription("");
    setModules([NEW_MODULE]);
    setQuizQuestions([]);
  }

  async function submitCourse() {
    const input: CreateCourseInput = {
      title,
      description,
      modules,
      questions: quizQuestions,
    };
    if (ceHours.length > 0) {
      input.ceHours = Number(ceHours);
    }
    try {
      const body = createCourseInputSchema.parse(input);
      const response = await axios.post("/api/v1/courses/create", body);
      console.log(response.data);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error("Unknown error occurred");
      }
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message);
      }
      if (error instanceof ZodError) {
        const pretty = z.prettifyError(error);
        throw new Error(pretty);
      }
      throw error;
    }
  }

  const courseCreatorValue: CourseCreatorValue = {
    modules,
    quizQuestions,
    title,
    description,
    ceHours,
    updateTitle,
    updateDescription,
    updateCeHours,
    addModule,
    updateModule,
    removeModule,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    clearForm,
    submitCourse,
  };

  return (
    <CourseCreatorContext value={courseCreatorValue}>
      <CreateCourseConsumer />
    </CourseCreatorContext>
  );
}