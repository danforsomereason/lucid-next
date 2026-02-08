import {
  usersTable,
  coursesTable,
  learningObjectivesTable,
  modulesTable,
  questionsTable,
  optionsTable,
  organizationsTable,
  jobRolesTable,
  moduleProgressTable,
  assignedCoursesTable,
  tracksTable,
  tracksAssignmentsTable,
  verifiedUsersTable,
  categoriesTable,
} from "./schema";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const userInsertSchema = createInsertSchema(usersTable);
export type UserInsert = z.infer<typeof userInsertSchema>;

// Full user update schema - for admin use
export const userUpdateSchema = createUpdateSchema(usersTable)
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const userSchema = createSelectSchema(usersTable, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>;

// Categories
export const categoryInsertSchema = createInsertSchema(categoriesTable);
export type CategoryInsert = z.infer<typeof categoryInsertSchema>;
export const categorySchema = createSelectSchema(categoriesTable);
export type Category = z.infer<typeof categorySchema>;

// Courses
export const courseInsertSchema = createInsertSchema(coursesTable);
export type CourseInsert = z.infer<typeof courseInsertSchema>;
export const courseSchema = createSelectSchema(coursesTable);
export type Course = z.infer<typeof courseSchema>;

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

// Questions
export const questionInsertSchema = createInsertSchema(questionsTable);
export type QuestionInsert = z.infer<typeof questionInsertSchema>;
export const questionSchema = createSelectSchema(questionsTable);
export type Question = z.infer<typeof questionSchema>;

// Options
export const optionInsertSchema = createInsertSchema(optionsTable);
export type OptionInsert = z.infer<typeof optionInsertSchema>;
export const optionSchema = createSelectSchema(optionsTable);
export type Option = z.infer<typeof optionSchema>;

// Organizations
export const organizationInsertSchema = createInsertSchema(organizationsTable);
export type OrganizationInsert = z.infer<typeof organizationInsertSchema>;
export const organizationSchema = createSelectSchema(
  organizationsTable,
  {
    createdAt: z.coerce.date(),
  }
);
export type Organization = z.infer<typeof organizationSchema>;

// Job Roles
export const jobRoleInsertSchema = createInsertSchema(jobRolesTable);
export type JobRoleInsert = z.infer<typeof jobRoleInsertSchema>;
export const jobRoleSchema = createSelectSchema(jobRolesTable);
export type JobRole = z.infer<typeof jobRoleSchema>;

// Module Progress
export const moduleProgressInsertSchema =
  createInsertSchema(moduleProgressTable);
export type ModuleProgressInsert = z.infer<typeof moduleProgressInsertSchema>;
export const moduleProgressSchema = createSelectSchema(
  moduleProgressTable,
  {
    startModule: z.coerce.date(),
    endModule: z.coerce.date().optional(),
  }
);
export type ModuleProgress = z.infer<typeof moduleProgressSchema>;

// Assigned Courses
export const assignedCourseInsertSchema =
  createInsertSchema(assignedCoursesTable);
export type AssignedCourseInsert = z.infer<typeof assignedCourseInsertSchema>;
export const assignedCourseSchema = createSelectSchema(
  assignedCoursesTable,
  {
    assignedDate: z.coerce.date(),
    completedAt: z.coerce.date().optional(),
  }
);
export type AssignedCourse = z.infer<typeof assignedCourseSchema>;

// Tracks
export const trackInsertSchema = createInsertSchema(tracksTable);
export type TrackInsert = z.infer<typeof trackInsertSchema>;
export const trackSchema = createSelectSchema(tracksTable, {
  complianceCycle: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Track = z.infer<typeof trackSchema>;

// Tracks Assignments
export const trackAssignmentInsertSchema = createInsertSchema(
  tracksAssignmentsTable
);
export type TrackAssignmentInsert = z.infer<
  typeof trackAssignmentInsertSchema
>;
export const tracksAssignmentSchema = createSelectSchema(
  tracksAssignmentsTable,
  {
    assignedAt: z.coerce.date(),
  }
);
export type TrackAssignment = z.infer<typeof tracksAssignmentSchema>;

// Verified Users
export const verifiedUserInsertSchema = createInsertSchema(verifiedUsersTable);
export type VerifiedUserInsert = z.infer<typeof verifiedUserInsertSchema>;
export const verifiedUserSchema = createSelectSchema(
  verifiedUsersTable,
  {
    invitedAt: z.coerce.date(),
  }
);
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

export const loginInputSchema = userInsertSchema.pick({
  email: true,
  password: true,
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginOutputSchema = userSchema.extend({
  token: z.string(),
});
export type LoginOutput = z.infer<typeof loginOutputSchema>;

// Profile update schema (update your user profile)
export const userProfileUpdateInputSchema = userUpdateSchema.pick({
  firstName: true,
  lastName: true,
  licenseType: true
})
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateInputSchema>;

export const userProfileUpdateOutputSchema = userSchema;
export type UserProfileUpdateOutput = z.infer<typeof userProfileUpdateOutputSchema>;

// Create course schemas
export const createCourseInputSchema = courseInsertSchema.pick({
  title: true,
  description: true,
  ceHours: true
}).extend({
  modules: moduleDefSchema.array().length(1),
  questions: questionDefSchema.array().length(1)
})
export type CreateCourseInput = z.infer<typeof createCourseInputSchema>

export const createCourseOutputSchema = courseSchema
export type CreateCourseOutput = z.infer<typeof createCourseOutputSchema>

// Read Course schemas
export const readCoursesOutputSchema = courseSchema.array()
export type ReadCoursesOutput = z.infer<typeof readCoursesOutputSchema>

// Assign Course schemas
export const assignCourseInputSchema = z.object({
  courseId: courseSchema.shape.id,
})
export type AssignCourseInput = z.infer<typeof assignCourseInputSchema>;

export const assignCourseOutputSchema = assignedCourseSchema;
export type AssignCourseOutput = z.infer<typeof assignCourseOutputSchema>;


export const endpointSchemas = {
  register: {
    input: registerInputSchema,
    output: registerOutputSchema,
  },
  login: {
    input: loginInputSchema,
    output: loginOutputSchema,
  },
  userProfileUpdate: {
    input: userProfileUpdateInputSchema,
    output: userProfileUpdateOutputSchema,
  },
  createCourse: {
    input: createCourseInputSchema,
    output: createCourseOutputSchema
  }
};
export type EndpointSchemas = typeof endpointSchemas;

export const relatedCourseSchema = courseSchema.extend({
  learningObjectives: learningObjectiveSchema.array(),
  instructor: userSchema,
})
export type RelatedCourse = z.infer<typeof relatedCourseSchema>;