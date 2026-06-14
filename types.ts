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

export type Db = typeof db;

const factory = createSchemaFactory({
  coerce: {
    date: true
  }
});

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

const organizationInsertSchema = factory.createInsertSchema(organizationsTable);
export type OrganizationInsert = z.infer<typeof organizationInsertSchema>;

const questionInsertSchema = factory.createInsertSchema(questionsTable);
export type QuestionInsert = z.infer<typeof questionInsertSchema>;
const questionSchema = factory.createSelectSchema(questionsTable);

const quizAnswerInsertSchema = factory.createInsertSchema(quizAnswersTable);
export type QuizAnswerInsert = z.infer<typeof quizAnswerInsertSchema>;

const surveyAnswerSchema = factory.createSelectSchema(surveyAnswersTable);
export type SurveyAnswer = z.infer<typeof surveyAnswerSchema>;
const surveyAnswerInsertSchema = factory.createInsertSchema(surveyAnswersTable);

export const userSchema = factory.createSelectSchema(usersTable)
export type User = z.infer<typeof userSchema>;
const userInsertSchema = factory.createInsertSchema(usersTable);
export type UserInsert = z.infer<typeof userInsertSchema>;
const userUpdateSchema = factory.createUpdateSchema(usersTable)

export const verifiedUserSchema = factory.createSelectSchema(verifiedUsersTable);
export type VerifiedUser = z.infer<typeof verifiedUserSchema>;
const verifiedUserInsertSchema = factory.createInsertSchema(verifiedUsersTable);
export type VerifiedUserInsert = z.infer<typeof verifiedUserInsertSchema>;

export const licenseTypeSchema = userInsertSchema.shape.licenseType;
export type LicenseType = z.infer<typeof licenseTypeSchema>;

export const roleSchema = userInsertSchema.shape.role;
export type Role = z.infer<typeof roleSchema>;

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
  user: userSchema,
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

export const upgradeUserOutputSchema = userSchema;
export type UpgradeUserOutput = z.infer<typeof upgradeUserOutputSchema>;

export const userProfileUpdateInputSchema = userUpdateSchema.pick({
  firstName: true,
  lastName: true,
  licenseType: true
})

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
