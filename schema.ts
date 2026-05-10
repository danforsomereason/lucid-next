import {
  pgTable,
  text,
  boolean,
  integer,
  pgEnum,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { time } from "console";

// Enums
export const roleEnum = pgEnum("role", [
  "admin",
  "instructor",
  "super_admin",
  "user",
]);

export const approvedByEnum = pgEnum("approved_by", [
  "NBCC",
  "APA",
  "ASWB",
  "NAADAC",
  "CAMFT",
  "Nursing",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "True/False",
  "Multiple Choice",
  "All That Apply",
]);

export const licenseTypeEnum = pgEnum("license_type", [
  "counseling",
  "social_work",
  "nursing",
  "addiction_counselor",
  "psychology",
  "physician",
  "peer_support",
]);

export const trackAssignmentStatusEnum = pgEnum("track_assignment_status", [
  "not_started",
  "in_progress",
  "completed",
  "overdue",
]);

// Tables
export const assignedCoursesTable = pgTable("assigned_courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id),
  organizationId: uuid("organization_id")
    .references(() => organizationsTable.id),
  quizAttempts: integer("quiz_attempts").notNull().default(0),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
})

export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
})

export const coursesTable = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  approvedBy: approvedByEnum("approved_by"),
  ceHours: integer("ce_hours"),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  instructorId: uuid("instructor_id")
    .notNull()
    .references(() => usersTable.id),
  maximumAttempts: integer("maximum_attempts").notNull(),
  passingScore: integer("passing_score").notNull(),
  premium: boolean("premium").notNull(),
  quizTitle: text("quiz_title"),
  title: text("title").notNull(),
});

export const courseCategoriesTable = pgTable("course_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoriesTable.id),
});

export const jobRolesTable = pgTable("job_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id),
});

export const learningObjectivesTable = pgTable("learning_objectives", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id),
  objective: text("objective").notNull(),
});

export const modulesTable = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  heading: text("heading").notNull(),
  order: integer("order").notNull(),
});

export const moduleProgressesTable = pgTable("module_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modulesTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  startModule: timestamp("start_module").notNull().defaultNow(),
  endModule: timestamp("end_module"),
});

export const optionsTable = pgTable("options", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questionsTable.id),
  option: text("option").notNull(),
  order: integer("order").notNull(),
});

export const organizationsTable = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questionsTable = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id),
  order: integer("order").notNull(),
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").notNull(),
  correctOptionOrder: integer("correct_option_order").notNull(),
  explanation: text("explanation").notNull(),
});

export const surveyAnswersTable = pgTable("survey_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignedCourseId: uuid("assigned_course_id")
    .references(() => assignedCoursesTable.id)
    .notNull(),
  order: integer("order").notNull(),
  answer: text("answer").notNull(),
  answeredAt: timestamp("answered_at").notNull().defaultNow(),
})

export const quizAnswersTable = pgTable("quiz_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  optionId: uuid("option_id")
    .notNull()
    .references(() => optionsTable.id),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questionsTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  answeredAt: timestamp("answered_at").notNull().defaultNow(),
});

export const tracksAssignmentsTable = pgTable("tracks_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  trackId: uuid("track_id")
    .notNull()
    .references(() => tracksTable.id),
  assignedBy: uuid("assigned_by")
    .notNull()
    .references(() => usersTable.id),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

export const tracksTable = pgTable("tracks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id),
  complianceCycle: timestamp("compliance_cycle").notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_DATE`),
  updatedBy: uuid("updated_by")
    .notNull()
    .references(() => usersTable.id),
  isMandatory: boolean("is_mandatory").notNull(),
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  organizationId: uuid("organization_id").references(
    () => organizationsTable.id
  ),
  licenseType: licenseTypeEnum("license_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  role: roleEnum("role").notNull(),
  jobRoleId: uuid("job_role_id").references(() => jobRolesTable.id),
});

export const verifiedUsersTable = pgTable("verified_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
});

// Relations
export const assignedCoursesRelations = relations(
  assignedCoursesTable,
  ({ one, many }) => ({
    course: one(coursesTable, {
      fields: [assignedCoursesTable.courseId],
      references: [coursesTable.id],
    }),
    organization: one(organizationsTable, {
      fields: [assignedCoursesTable.organizationId],
      references: [organizationsTable.id],
    }),
    user: one(usersTable, {
      fields: [assignedCoursesTable.userId],
      references: [usersTable.id],
    }),
    surveyAnswers: many(surveyAnswersTable)
  })
);

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  courseCategories: many(courseCategoriesTable),
}));

export const coursesRelations = relations(coursesTable, ({ one, many }) => ({
  instructor: one(usersTable, {
    fields: [coursesTable.instructorId],
    references: [usersTable.id],
  }),
  learningObjectives: many(learningObjectivesTable),
  modules: many(modulesTable),
  questions: many(questionsTable),
  assignedCourses: many(assignedCoursesTable),
  courseCategories: many(courseCategoriesTable),
}));

export const learningObjectivesRelations = relations(
  learningObjectivesTable,
  ({ one }) => ({
    course: one(coursesTable, {
      fields: [learningObjectivesTable.courseId],
      references: [coursesTable.id],
    }),
  })
);

export const modulesRelations = relations(modulesTable, ({ one, many }) => ({
  course: one(coursesTable, {
    fields: [modulesTable.courseId],
    references: [coursesTable.id],
  }),
  moduleProgresses: many(moduleProgressesTable),
}));

export const optionsRelations = relations(optionsTable, ({ one, many }) => ({
  question: one(questionsTable, {
    fields: [optionsTable.questionId],
    references: [questionsTable.id],
  }),
  answers: many(quizAnswersTable),
}));

export const organizationsRelations = relations(
  organizationsTable,
  ({ many }) => ({
    users: many(usersTable),
    jobRoles: many(jobRolesTable),
    assignedCourses: many(assignedCoursesTable),
    tracks: many(tracksTable),
    verifiedUsers: many(verifiedUsersTable),
  })
);

export const jobRolesRelations = relations(jobRolesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [jobRolesTable.organizationId],
    references: [organizationsTable.id],
  }),
  users: many(usersTable),
}));

export const moduleProgressRelations = relations(
  moduleProgressesTable,
  ({ one }) => ({
    module: one(modulesTable, {
      fields: [moduleProgressesTable.moduleId],
      references: [modulesTable.id],
    }),
    user: one(usersTable, {
      fields: [moduleProgressesTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const questionsRelations = relations(
  questionsTable,
  ({ one, many }) => ({
    quizAnswers: many(quizAnswersTable),
    course: one(coursesTable, {
      fields: [questionsTable.courseId],
      references: [coursesTable.id],
    }),
    options: many(optionsTable),
  })
);

export const quizAnswersRelations = relations(quizAnswersTable, ({ one }) => ({
  option: one(optionsTable, {
    fields: [quizAnswersTable.optionId],
    references: [optionsTable.id],
  }),
  question: one(questionsTable, {
    fields: [quizAnswersTable.questionId],
    references: [questionsTable.id],
  }),
  user: one(usersTable, {
    fields: [quizAnswersTable.userId],
    references: [usersTable.id],
  }),
}));

export const surveyAnswersRelations = relations(surveyAnswersTable, ({ one }) => ({
  assignedCourse: one(assignedCoursesTable, {
    fields: [surveyAnswersTable.assignedCourseId],
    references: [assignedCoursesTable.id],
  }),
}))

export const tracksRelations = relations(tracksTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [tracksTable.organizationId],
    references: [organizationsTable.id],
  }),
  updatedByUser: one(usersTable, {
    fields: [tracksTable.updatedBy],
    references: [usersTable.id],
  }),
  tracksAssignments: many(tracksAssignmentsTable),
}));

export const tracksAssignmentsRelations = relations(
  tracksAssignmentsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [tracksAssignmentsTable.userId],
      references: [usersTable.id],
    }),
    track: one(tracksTable, {
      fields: [tracksAssignmentsTable.trackId],
      references: [tracksTable.id],
    }),
    assignedByUser: one(usersTable, {
      fields: [tracksAssignmentsTable.assignedBy],
      references: [usersTable.id],
      relationName: "assignedBy",
    }),
  })
);

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  quizAnswers: many(quizAnswersTable),
  organization: one(organizationsTable, {
    fields: [usersTable.organizationId],
    references: [organizationsTable.id],
  }),
  jobRole: one(jobRolesTable, {
    fields: [usersTable.jobRoleId],
    references: [jobRolesTable.id],
  }),
  courses: many(coursesTable),
  moduleProgress: many(moduleProgressesTable),
  assignedCourses: many(assignedCoursesTable),
  tracksUpdated: many(tracksTable),
  tracksAssignments: many(tracksAssignmentsTable),
  tracksAssignmentsAssigned: many(tracksAssignmentsTable, {
    relationName: "assignedBy",
  }),
}));

export const verifiedUsersRelations = relations(
  verifiedUsersTable,
  ({ one }) => ({
    organization: one(organizationsTable, {
      fields: [verifiedUsersTable.organizationId],
      references: [organizationsTable.id],
    }),
  })
);
