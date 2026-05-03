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
import { createSchemaFactory } from "drizzle-zod";
import { check, z } from "zod";

const factory = createSchemaFactory({
  coerce: {
    date: true
  }
});

// Assigned Courses

// Convert Drizzle table to Zod schema
export const assignedCourseSchema = factory.createSelectSchema(assignedCoursesTable);
// Convert Zod schema to TypeScript type
export type AssignedCourse = z.infer<typeof assignedCourseSchema>;


// Convert Drizzle table to Zod schema
export const assignedCourseInsertSchema = factory.createInsertSchema(assignedCoursesTable);
// Convert Zod schema to TypeScript type
export type AssignedCourseInsert = z.infer<typeof assignedCourseInsertSchema>;

// Categories
export const categorySchema = factory.createSelectSchema(categoriesTable);
export type Category = z.infer<typeof categorySchema>;
export const categoryInsertSchema = factory.createInsertSchema(categoriesTable);
export type CategoryInsert = z.infer<typeof categoryInsertSchema>;

// Courses
export const courseSchema = factory.createSelectSchema(coursesTable);
export type Course = z.infer<typeof courseSchema>;
export const courseInsertSchema = factory.createInsertSchema(coursesTable);
export type CourseInsert = z.infer<typeof courseInsertSchema>;

// Job Roles
export const jobRoleInsertSchema = factory.createInsertSchema(jobRolesTable);
export type JobRoleInsert = z.infer<typeof jobRoleInsertSchema>;
export const jobRoleSchema = factory.createSelectSchema(jobRolesTable);
export type JobRole = z.infer<typeof jobRoleSchema>;

// Learning Objectives
export const learningObjectiveInsertSchema = factory.createInsertSchema(
  learningObjectivesTable
);
export type LearningObjectiveInsert = z.infer<
  typeof learningObjectiveInsertSchema
>;
export const learningObjectiveSchema = factory.createSelectSchema(
  learningObjectivesTable
);
export type LearningObjective = z.infer<typeof learningObjectiveSchema>;

// Modules
export const moduleInsertSchema = factory.createInsertSchema(modulesTable);
export type ModuleInsert = z.infer<typeof moduleInsertSchema>;
export const moduleSchema = factory.createSelectSchema(modulesTable);
export type Module = z.infer<typeof moduleSchema>;

// Options
export const optionInsertSchema = factory.createInsertSchema(optionsTable);
export type OptionInsert = z.infer<typeof optionInsertSchema>;
export const optionSchema = factory.createSelectSchema(optionsTable);
export type Option = z.infer<typeof optionSchema>;

// Organizations
export const organizationInsertSchema = factory.createInsertSchema(organizationsTable);
export type OrganizationInsert = z.infer<typeof organizationInsertSchema>;
export const organizationSchema = factory.createSelectSchema(organizationsTable);
export type Organization = z.infer<typeof organizationSchema>;

// Module Progress
export const moduleProgressInsertSchema = factory.createInsertSchema(moduleProgressesTable);
export type ModuleProgressInsert = z.infer<typeof moduleProgressInsertSchema>;
export const moduleProgressSchema = factory.createSelectSchema(moduleProgressesTable);
export type ModuleProgress = z.infer<typeof moduleProgressSchema>;

// Questions
export const questionInsertSchema = factory.createInsertSchema(questionsTable);
export type QuestionInsert = z.infer<typeof questionInsertSchema>;
export const questionSchema = factory.createSelectSchema(questionsTable);
export type Question = z.infer<typeof questionSchema>;

// Quiz Answers
export const quizAnswerSchema = factory.createSelectSchema(quizAnswersTable);
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export const quizAnswerInsertSchema = factory.createInsertSchema(quizAnswersTable);
export type QuizAnswerInsert = z.infer<typeof quizAnswerInsertSchema>;

// Survey Answers
export const surveyAnswerSchema = factory.createSelectSchema(surveyAnswersTable);
export type SurveyAnswer = z.infer<typeof surveyAnswerSchema>;
export const surveyAnswerInsertSchema = factory.createInsertSchema(surveyAnswersTable);
export type SurveyAnswerInsert = z.infer<typeof surveyAnswerInsertSchema>;

// Tracks
export const trackInsertSchema = factory.createInsertSchema(tracksTable);
export type TrackInsert = z.infer<typeof trackInsertSchema>;
export const trackSchema = factory.createSelectSchema(tracksTable);
export type Track = z.infer<typeof trackSchema>;

// Tracks Assignments
export const trackAssignmentInsertSchema = factory.createInsertSchema(
  tracksAssignmentsTable
);
export type TrackAssignmentInsert = z.infer<
  typeof trackAssignmentInsertSchema
>;
export const tracksAssignmentSchema = factory.createSelectSchema(tracksAssignmentsTable);
export type TrackAssignment = z.infer<typeof tracksAssignmentSchema>;

// Users
export const userSchema = factory.createSelectSchema(usersTable)
export type User = z.infer<typeof userSchema>;
export const userInsertSchema = factory.createInsertSchema(usersTable);
export type UserInsert = z.infer<typeof userInsertSchema>;
export const userUpdateSchema = factory.createUpdateSchema(usersTable)
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Verified Users
export const verifiedUserInsertSchema = factory.createInsertSchema(verifiedUsersTable);
export type VerifiedUserInsert = z.infer<typeof verifiedUserInsertSchema>;
export const verifiedUserSchema = factory.createSelectSchema(verifiedUsersTable);
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
  optionId: z.string(),
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
})
export type RelatedQuestion = z.infer<typeof relatedQuestionSchema>;

export const safeQuestionSchema = relatedQuestionSchema.omit({
  correctOptionOrder: true,
  explanation: true,
})
export type SafeQuestion = z.infer<typeof safeQuestionSchema>;