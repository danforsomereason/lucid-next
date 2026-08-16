import {
  usersTable,
  coursesTable,
  learningObjectivesTable,
  modulesTable,
  questionsTable,
  optionsTable,
  moduleProgressesTable,
  assignedCoursesTable,
  categoriesTable,
  quizAnswersTable,
  surveyAnswersTable,
  verifiedUsersTable,
  organizationsTable,
} from "./schema";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";
import db from "@/db";
import { Dispatch, SetStateAction } from "react";

const factory = createSchemaFactory({
  coerce: {
    date: true
  }
});

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type Db = typeof db | Tx;

const assignedCourseSchema = factory.createSelectSchema(assignedCoursesTable);
export type AssignedCourse = z.infer<typeof assignedCourseSchema>;

const categorySchema = factory.createSelectSchema(categoriesTable);
export type Category = z.infer<typeof categorySchema>;

const courseSchema = factory.createSelectSchema(coursesTable);
export type Course = z.infer<typeof courseSchema>;
const courseInsertSchema = factory.createInsertSchema(coursesTable);

const learningObjectiveSchema = factory.createSelectSchema(
  learningObjectivesTable
);

const moduleInsertSchema = factory.createInsertSchema(modulesTable);
export type ModuleInsert = z.infer<typeof moduleInsertSchema>;
const moduleSchema = factory.createSelectSchema(modulesTable);
export type Module = z.infer<typeof moduleSchema>;

const optionInsertSchema = factory.createInsertSchema(optionsTable);
export type OptionInsert = z.infer<typeof optionInsertSchema>;
const optionSchema = factory.createSelectSchema(optionsTable);
export type Option = z.infer<typeof optionSchema>;

const moduleProgressSchema = factory.createSelectSchema(moduleProgressesTable);
export type ModuleProgress = z.infer<typeof moduleProgressSchema>;

const organizationSchema = factory.createSelectSchema(organizationsTable);
export type Organization = z.infer<typeof organizationSchema>;
const organizationInsertSchema = factory.createInsertSchema(organizationsTable);
export type OrganizationInsert = z.infer<typeof organizationInsertSchema>;

const questionInsertSchema = factory.createInsertSchema(questionsTable);
export type QuestionInsert = z.infer<typeof questionInsertSchema>;
const questionSchema = factory.createSelectSchema(questionsTable);
export type Question = z.infer<typeof questionSchema>;

const quizAnswerInsertSchema = factory.createInsertSchema(quizAnswersTable);
export type QuizAnswerInsert = z.infer<typeof quizAnswerInsertSchema>;

const surveyAnswerSchema = factory.createSelectSchema(surveyAnswersTable);
export type SurveyAnswer = z.infer<typeof surveyAnswerSchema>;
const surveyAnswerInsertSchema = factory.createInsertSchema(surveyAnswersTable);
export type SurveyAnswerInsert = z.infer<typeof surveyAnswerInsertSchema>;

export const userSchema = factory.createSelectSchema(usersTable)
export type User = z.infer<typeof userSchema>;
const userInsertSchema = factory.createInsertSchema(usersTable);
export type UserInsert = z.infer<typeof userInsertSchema>;
const userUpdateSchema = factory.createUpdateSchema(usersTable)
export type UserFind = NonNullable<Parameters<typeof db.query.usersTable.findMany>[0]>;

export const verifiedUserSchema = factory.createSelectSchema(verifiedUsersTable);
export type VerifiedUser = z.infer<typeof verifiedUserSchema>;
const verifiedUserInsertSchema = factory.createInsertSchema(verifiedUsersTable);
export type VerifiedUserInsert = z.infer<typeof verifiedUserInsertSchema>;

export const licenseTypeSchema = userInsertSchema.shape.licenseType;
export type LicenseType = z.infer<typeof licenseTypeSchema>;

export const roleSchema = userInsertSchema.shape.role;
export type Role = z.infer<typeof roleSchema>;

export const relatedUserSchema = userSchema.extend({
  organization: organizationSchema.nullable(),
})
export type RelatedUser = z.infer<typeof relatedUserSchema>;

export const relatedAdminUserSchema = relatedUserSchema.extend({
  role: z.union([
    z.literal('super_admin'),
    z.literal('instructor'),
    z.literal('admin')
  ]),
  organization: organizationSchema,
  organizationId: z.string(),
})
export type RelatedAdminUser = z.infer<typeof relatedAdminUserSchema>;

export const tokenPayloadSchema = z.object({
  userId: z.string(),
});
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

const questionDefSchema = questionInsertSchema.pick({
  questionText: true,
  questionType: true,
  explanation: true,
  correctOptionOrder: true
}).extend({
  options: z.string().array(),
})
export type QuestionDef = z.infer<typeof questionDefSchema>;

export const questionTypeSchema = questionInsertSchema.shape.questionType;
export type QuestionType = z.infer<typeof questionTypeSchema>;

const moduleDefSchema = moduleInsertSchema.pick({
  heading: true,
  content: true,
  estimatedMinutes: true,
})
export type ModuleDef = z.infer<typeof moduleDefSchema>;

export const assignCourseInputSchema = z.object({
  courseId: courseSchema.shape.id,
})

const checkQuestionInputSchema = z.object({
  questionId: questionSchema.shape.id,
  optionId: z.string(),
})

export type CheckQuestionInput = z.infer<typeof checkQuestionInputSchema>;

export const checkQuestionsInputSchema = z.object({
  answers: checkQuestionInputSchema.array(),
  courseId: z.string(),
})
export type CheckQuestionsInput = z.infer<typeof checkQuestionsInputSchema>;

const checkQuestionOutputSchema = z.object({
  correct: z.boolean(),
  correctAnswer: z.string(),
  explanation: z.string(),
})
export type CheckQuestionOutput = z.infer<typeof checkQuestionOutputSchema>;

export const checkQuestionsOutputSchema = z.object({
  maximized: z.boolean(),
  passing: z.boolean(),
  results: checkQuestionOutputSchema.array(),
})
export type CheckQuestionsOutput = z.infer<typeof checkQuestionsOutputSchema>;

export const createCourseInputSchema = courseInsertSchema.pick({
  title: true,
  description: true,
  ceHours: true,
  maximumAttempts: true,
  passingScore: true,
}).extend({
  modules: moduleDefSchema.array().length(1),
  questions: questionDefSchema.array().length(1)
})
export type CreateCourseInput = z.infer<typeof createCourseInputSchema>

export const createCourseOutputSchema = courseSchema

export const endModuleInputSchema = z.object({
  moduleId: moduleSchema.shape.id,
})
export type EndModuleInput = z.infer<typeof endModuleInputSchema>;

export const endModuleOutputSchema = moduleProgressSchema;

export const loginInputSchema = userInsertSchema.pick({
  email: true,
  password: true,
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginOutputSchema = z.object({
  token: z.string(),
  user: relatedUserSchema
})
export type LoginOutput = z.infer<typeof loginOutputSchema>;

export const readCoursesOutputSchema = courseSchema.array()
export type ReadCoursesOutput = z.infer<typeof readCoursesOutputSchema>

export const registerInputSchema = userInsertSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  licenseType: true,
});
export const registerTeamInputSchema = registerInputSchema.extend({
  organization: z.string(),
  verifiedUsers: z.string().array()
});
export type RegisterTeamInput = z.infer<typeof registerTeamInputSchema>;

export const registerOutputSchema = z.object({
  token: z.string(),
  user: relatedUserSchema,
});
export type RegisterOutput = z.infer<typeof registerOutputSchema>;

export const surveyInputSchema = surveyAnswerInsertSchema
export type SurveyInput = z.infer<typeof surveyInputSchema>;

export const surveyOutputSchema = surveyAnswerSchema;
export type SurveyOutput = z.infer<typeof surveyOutputSchema>;

export const upgradeUserInputSchema = z.object({
  userId: z.string(),
})
export type UpgradeUserInput = z.infer<typeof upgradeUserInputSchema>;

export const upgradeUserOutputSchema = relatedUserSchema;
export type UpgradeUserOutput = z.infer<typeof upgradeUserOutputSchema>;

export const userProfileUpdateInputSchema = userUpdateSchema.pick({
  firstName: true,
  lastName: true,
  licenseType: true
})

export const verifyUserInputSchema = z.object({
  email: z.string()
})
export type VerifyUserInput = z.infer<typeof verifyUserInputSchema>;

export const verifyUserOutputSchema = verifiedUserSchema;
export type VerifyUserOutput = z.infer<typeof verifyUserOutputSchema>;

export const relatedCourseSchema = courseSchema.extend({
  learningObjectives: learningObjectiveSchema.array(),
  instructor: userSchema,
})
export type RelatedCourse = z.infer<typeof relatedCourseSchema>;

const relatedModuleSchema = moduleSchema.extend({
  moduleProgresses: moduleProgressSchema.array(),
})
export type RelatedModule = z.infer<typeof relatedModuleSchema>;

const relatedQuestionSchema = questionSchema.extend({
  options: optionSchema.array(),
})
export type RelatedQuestion = z.infer<typeof relatedQuestionSchema>;

const safeQuestionSchema = relatedQuestionSchema.omit({
  correctOptionOrder: true,
  explanation: true,
})
export type SafeQuestion = z.infer<typeof safeQuestionSchema>;

// UI

export const INSTRUCTOR_ROLES = ["instructor", "super_admin"]

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

export interface GlobalValue {
  currentUser?: RelatedUser
  setCurrentUser: Dispatch<SetStateAction<RelatedUser | undefined>>;
}

export interface CourseCreatorContextValue {
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

export interface CourseModulesContextValue {
  advanceQuestion: () => Promise<void>
  advanceSurvey: () => Promise<void>
  assignedCourse: AssignedCourse
  completeModule: () => Promise<void>
  course: RelatedCourse
  moduleProgresses: ModuleProgress[]
  modules: Module[]
  modulesCompleted: boolean
  onLastQuestion: boolean
  questions: SafeQuestion[]
  quizCompleted: boolean
  quizShown: boolean
  results: CheckQuestionOutput[]
  restart: () => void
  retakeQuiz: () => void
  score: number
  selectModule: (moduleId: string) => void
  selectOption: (optionId: string) => void
  selectedModuleId?: string
  selectedModule?: Module
  selectedOption?: Option
  selectedOptionId?: string
  selectedQuestionId?: string
  selectedQuestion?: SafeQuestion
  selectSurveyAnswer: (answer: string) => void
  showQuiz: () => void
  showSurvey: () => void
  surveyAnswer: string
  surveyAnswers: SurveyAnswer[]
  surveyCompleted: boolean
  surveyShown: boolean
}

export interface UsersContextValue {
  rows: RelatedUser[]
  upgrade: (props: { 
    userId: string
  }) => Promise<void>
}

export interface UserContextValue {
  row: RelatedUser
  upgrade: () => Promise<void>
}