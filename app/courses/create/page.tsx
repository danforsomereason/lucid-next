'use client'

import { useState } from "react";
import { NEW_MODULE, NEW_QUIZ_QUESTION } from "@/constants";
import { CreateCourseInput, createCourseInputSchema, ModuleDef, QuestionDef } from "@/types";
import CreateCourseConsumer from "@/components/CreateCourseConsumer";
import {
  CourseCreatorValue,
  CourseCreatorContext,
} from "@/context/courseCreatorContext";
import axios from "axios";
import z, { ZodError } from "zod";

export default function CoursesCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState<ModuleDef[]>([NEW_MODULE]);
  const [quizQuestions, setQuizQuestions] = useState<QuestionDef[]>([NEW_QUIZ_QUESTION]);
  const [ceHours, setCeHours] = useState('');
  const [passingScore, setPassingScore] = useState('');
  const [maximumAttempts, setMaximumAttempts] = useState('');

  function updateTitle(value: string) {
    setTitle(value);
  }

  function updateDescription(value: string) {
    setDescription(value);
  }

  function updateCeHours(value: string) {
    setCeHours(value);
  }
  function updatePassingScore(value: string) {
    setPassingScore(value);
  }
  function updateMaximumAttempts(value: string) {
    setMaximumAttempts(value);
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
    setPassingScore("");
    setMaximumAttempts("");
  }

  async function submitCourse() {
    console.log('submitCourse called')
    if (title.length === 0) {
      throw new Error("Title is required");
    }
    if (description.length === 0) {
      throw new Error("Description is required");
    }
    if (maximumAttempts.length === 0) {
      throw new Error("Maximum attempts is required");
    }
    const maximumAttemptsNumber = Number(maximumAttempts);
    if (isNaN(maximumAttemptsNumber) || maximumAttemptsNumber <= 0) {
      throw new Error("Maximum attempts must be a positive number");
    }
    if (modules.length === 0) {
      throw new Error("At least one module is required");
    }
    if (passingScore.length === 0) {
      throw new Error("Passing score is required");
    }
    const passingScoreNumber = Number(passingScore);
    if (isNaN(passingScoreNumber) || passingScoreNumber < 0) {
      throw new Error("Passing score must be a positive number or 0");
    }
    const input: CreateCourseInput = {
      title,
      description,
      maximumAttempts: maximumAttemptsNumber,
      modules,
      passingScore: passingScoreNumber,
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
    ceHours,
    description,
    maximumAttempts,
    modules,
    passingScore,
    quizQuestions,
    title,
    updateCeHours,
    updateDescription,
    updateMaximumAttempts,
    updateOption,
    updatePassingScore,
    updateTitle,
    addModule,
    updateModule,
    removeModule,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addOption,
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