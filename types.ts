import {
  usersTable,
  coursesTable,
  learningObjectivesTable,
  modulesTable,
  questionsTable,
  optionsTable,
  organizationsTable,
  jobRolesTable,
  moduleProgressesTable,
  assignedCoursesTable,
  tracksTable,
  tracksAssignmentsTable,
  verifiedUsersTable,
  categoriesTable,
  quizAnswersTable,
  surveyAnswersTable,
} from "./schema";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { check, z } from "zod";

// Assigned Courses

// Convert Drizzle table to Zod schema
export const assignedCourseSchema = createSelectSchema(assignedCoursesTable);
// Convert Zod schema to TypeScript type
export type AssignedCourse = z.infer<typeof assignedCourseSchema>;


// Convert Drizzle table to Zod schema
export const assignedCourseInsertSchema = createInsertSchema(assignedCoursesTable);
// Convert Zod schema to TypeScript type
export type AssignedCourseInsert = z.infer<typeof assignedCourseInsertSchema>;

// Categories
export const categorySchema = createSelectSchema(categoriesTable);
export type Category = z.infer<typeof categorySchema>;
export const categoryInsertSchema = createInsertSchema(categoriesTable);
export type CategoryInsert = z.infer<typeof categoryInsertSchema>;

// Courses
export const courseSchema = createSelectSchema(coursesTable);
export type Course = z.infer<typeof courseSchema>;
export const courseInsertSchema = createInsertSchema(coursesTable);
export type CourseInsert = z.infer<typeof courseInsertSchema>;

// Job Roles
export const jobRoleInsertSchema = createInsertSchema(jobRolesTable);
export type JobRoleInsert = z.infer<typeof jobRoleInsertSchema>;
export const jobRoleSchema = createSelectSchema(jobRolesTable);
export type JobRole = z.infer<typeof jobRoleSchema>;

// Learning Objectives
export const learningObjectiveInsertSchema = createInsertSchema(
  learningObjectivesTable
);
export type LearningObjectiveInsert = z.infer<
  typeof learningObjectiveInsertSchema
>;
export const learningObjectiveSchema = createSelectSchema(
  learningObjectivesTable
);
export type LearningObjective = z.infer<typeof learningObjectiveSchema>;

// Modules
export const moduleInsertSchema = createInsertSchema(modulesTable);
export type ModuleInsert = z.infer<typeof moduleInsertSchema>;
export const moduleSchema = createSelectSchema(modulesTable);
export type Module = z.infer<typeof moduleSchema>;

// Options
export const optionInsertSchema = createInsertSchema(optionsTable);
export type OptionInsert = z.infer<typeof optionInsertSchema>;
export const optionSchema = createSelectSchema(optionsTable);
export type Option = z.infer<typeof optionSchema>;

// Organizations
export const organizationInsertSchema = createInsertSchema(organizationsTable);
export type OrganizationInsert = z.infer<typeof organizationInsertSchema>;
export const organizationSchema = createSelectSchema(organizationsTable);
export type Organization = z.infer<typeof organizationSchema>;

// Module Progress
export const moduleProgressInsertSchema = createInsertSchema(moduleProgressesTable);
export type ModuleProgressInsert = z.infer<typeof moduleProgressInsertSchema>;
export const moduleProgressSchema = createSelectSchema(moduleProgressesTable);
export type ModuleProgress = z.infer<typeof moduleProgressSchema>;

// Questions
export const questionInsertSchema = createInsertSchema(questionsTable);
export type QuestionInsert = z.infer<typeof questionInsertSchema>;
export const questionSchema = createSelectSchema(questionsTable);
export type Question = z.infer<typeof questionSchema>;

// Quiz Answers
export const quizAnswerSchema = createSelectSchema(quizAnswersTable);
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export const quizAnswerInsertSchema = createInsertSchema(quizAnswersTable);
export type QuizAnswerInsert = z.infer<typeof quizAnswerInsertSchema>;

// Survey Answers
export const surveyAnswerSchema = createSelectSchema(surveyAnswersTable);
export type SurveyAnswer = z.infer<typeof surveyAnswerSchema>;
export const surveyAnswerInsertSchema = createInsertSchema(surveyAnswersTable);
export type SurveyAnswerInsert = z.infer<typeof surveyAnswerInsertSchema>;

// Tracks
export const trackInsertSchema = createInsertSchema(tracksTable);
export type TrackInsert = z.infer<typeof trackInsertSchema>;
export const trackSchema = createSelectSchema(tracksTable);
export type Track = z.infer<typeof trackSchema>;

// Tracks Assignments
export const trackAssignmentInsertSchema = createInsertSchema(
  tracksAssignmentsTable
);
export type TrackAssignmentInsert = z.infer<
  typeof trackAssignmentInsertSchema
>;
export const tracksAssignmentSchema = createSelectSchema(tracksAssignmentsTable);
export type TrackAssignment = z.infer<typeof tracksAssignmentSchema>;

// Users
export const userSchema = createSelectSchema(usersTable)
export type User = z.infer<typeof userSchema>;
export const userInsertSchema = createInsertSchema(usersTable);
export type UserInsert = z.infer<typeof userInsertSchema>;
export const userUpdateSchema = createUpdateSchema(usersTable)
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Verified Users
export const verifiedUserInsertSchema = createInsertSchema(verifiedUsersTable);
export type VerifiedUserInsert = z.infer<typeof verifiedUserInsertSchema>;
export const verifiedUserSchema = createSelectSchema(verifiedUsersTable);
export type VerifiedUser = z.infer<typeof verifiedUserSchema>;

// Custom Schemas
export const questionDefSchema = questionInsertSchema.pick({
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

export const moduleDefSchema = moduleInsertSchema.pick({
  heading: true,
  content: true,
  estimatedMinutes: true,
})
export type ModuleDef = z.infer<typeof moduleDefSchema>;

// Endpoint Schemas

// Assign Course
export const assignCourseInputSchema = z.object({
  courseId: courseSchema.shape.id,
})
export type AssignCourseInput = z.infer<typeof assignCourseInputSchema>;

export const assignCourseOutputSchema = assignedCourseSchema;
export type AssignCourseOutput = z.infer<typeof assignCourseOutputSchema>;

// Check Questions
export const checkQuestionInputSchema = z.object({
  questionId: questionSchema.shape.id,
  selectedOptionOrder: z.number(),
})

export type CheckQuestionInput = z.infer<typeof checkQuestionInputSchema>;

export const checkQuestionsInputSchema = z.object({
  answers: checkQuestionInputSchema.array(),
  courseId: z.string(),
})
export type CheckQuestionsInput = z.infer<typeof checkQuestionsInputSchema>;

export const checkQuestionOutputSchema = z.object({
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

// Create course
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
export type CreateCourseOutput = z.infer<typeof createCourseOutputSchema>

// End Module
export const endModuleInputSchema = z.object({
  moduleId: moduleSchema.shape.id,
})
export type EndModuleInput = z.infer<typeof endModuleInputSchema>;

export const endModuleOutputSchema = moduleProgressSchema;
export type EndModuleOutput = z.infer<typeof endModuleOutputSchema>;

// Login
export const loginInputSchema = userInsertSchema.pick({
  email: true,
  password: true,
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginOutputSchema = userSchema.extend({
  token: z.string(),
});
export type LoginOutput = z.infer<typeof loginOutputSchema>;

// Read Course
export const readCoursesOutputSchema = courseSchema.array()
export type ReadCoursesOutput = z.infer<typeof readCoursesOutputSchema>

// Register
export const registerInputSchema = userInsertSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  licenseType: true,
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const registerOutputSchema = z.object({
  token: z.string(),
  user: userSchema,
});
export type RegisterOutput = z.infer<typeof registerOutputSchema>;

// Survey
export const surveyInputSchema = surveyAnswerInsertSchema
export type SurveyInput = z.infer<typeof surveyInputSchema>;

export const surveyOutputSchema = surveyAnswerSchema;
export type SurveyOutput = z.infer<typeof surveyOutputSchema>;

// Update Profile
export const userProfileUpdateInputSchema = userUpdateSchema.pick({
  firstName: true,
  lastName: true,
  licenseType: true
})
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateInputSchema>;

export const userProfileUpdateOutputSchema = userSchema;
export type UserProfileUpdateOutput = z.infer<typeof userProfileUpdateOutputSchema>;

export const endpointSchemas = {
  checkQuestions: {
    input: checkQuestionsInputSchema,
    output: checkQuestionsOutputSchema
  },
  createCourse: {
    input: createCourseInputSchema,
    output: createCourseOutputSchema
  },
  login: {
    input: loginInputSchema,
    output: loginOutputSchema,
  },
  register: {
    input: registerInputSchema,
    output: registerOutputSchema,
  },
  survey: {
    input: surveyInputSchema,
    output: surveyOutputSchema,
  },
  userProfileUpdate: {
    input: userProfileUpdateInputSchema,
    output: userProfileUpdateOutputSchema,
  },
};
export type EndpointSchemas = typeof endpointSchemas;

export const relatedCourseSchema = courseSchema.extend({
  learningObjectives: learningObjectiveSchema.array(),
  instructor: userSchema,
})
export type RelatedCourse = z.infer<typeof relatedCourseSchema>;

export const relatedModuleSchema = moduleSchema.extend({
  moduleProgresses: moduleProgressSchema.array(),
})
export type RelatedModule = z.infer<typeof relatedModuleSchema>;

export const relatedQuestionSchema = questionSchema.extend({
  options: optionSchema.array(),
  quizAnswers: quizAnswerSchema.array(),
})
export type RelatedQuestion = z.infer<typeof relatedQuestionSchema>;

export const safeQuestionSchema = relatedQuestionSchema.omit({
  correctOptionOrder: true,
  explanation: true,
})
export type SafeQuestion = z.infer<typeof safeQuestionSchema>;