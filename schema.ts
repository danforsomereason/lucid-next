import {
  pgTable,
  text,
  boolean,
  integer,
  pgEnum,
  date,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

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
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_DATE`),
  role: roleEnum("role").notNull(),
  jobRoleId: uuid("job_role_id").references(() => jobRolesTable.id),
});


export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
})

export const coursesTable = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructorId: uuid("instructor_id")
    .notNull()
    .references(() => usersTable.id),
  premium: boolean("premium").notNull(),
  passingScore: integer("passing_score"),
  approvedBy: approvedByEnum("approved_by"),
  imageUrl: text("image_url"),
  ceHours: integer("ce_hours"),
  quizTitle: text("quiz_title"),
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
  createdAt: date("created_at").notNull().defaultNow(),
});

export const jobRolesTable = pgTable("job_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id),
});

export const moduleProgressTable = pgTable("module_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modulesTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  startModule: date("start_module").notNull().defaultNow(),
  endModule: date("end_module"),
});

export const assignedCoursesTable = pgTable("assigned_courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  organizationId: uuid("organization_id")
    .references(() => organizationsTable.id),
  assignedDate: date("assigned_date").notNull().defaultNow(),
  completedAt: date("completed_at"),
});

export const tracksTable = pgTable("tracks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id),
  complianceCycle: date("compliance_cycle").notNull(),
  updatedAt: date("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_DATE`),
  updatedBy: uuid("updated_by")
    .notNull()
    .references(() => usersTable.id),
  isMandatory: boolean("is_mandatory").notNull(),
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
  assignedAt: date("assigned_at").notNull().defaultNow(),
});

export const verifiedUsersTable = pgTable("verified_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id),
  invitedAt: date("invited_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [usersTable.organizationId],
    references: [organizationsTable.id],
  }),
  jobRole: one(jobRolesTable, {
    fields: [usersTable.jobRoleId],
    references: [jobRolesTable.id],
  }),
  courses: many(coursesTable),
  moduleProgress: many(moduleProgressTable),
  assignedCourses: many(assignedCoursesTable),
  tracksUpdated: many(tracksTable),
  tracksAssignments: many(tracksAssignmentsTable),
  tracksAssignmentsAssigned: many(tracksAssignmentsTable, {
    relationName: "assignedBy",
  }),
}));

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
  moduleProgress: many(moduleProgressTable),
}));

export const questionsRelations = relations(
  questionsTable,
  ({ one, many }) => ({
    course: one(coursesTable, {
      fields: [questionsTable.courseId],
      references: [coursesTable.id],
    }),
    options: many(optionsTable),
  })
);

export const optionsRelations = relations(optionsTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [optionsTable.questionId],
    references: [questionsTable.id],
  }),
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
  moduleProgressTable,
  ({ one }) => ({
    module: one(modulesTable, {
      fields: [moduleProgressTable.moduleId],
      references: [modulesTable.id],
    }),
    user: one(usersTable, {
      fields: [moduleProgressTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const assignedCoursesRelations = relations(
  assignedCoursesTable,
  ({ one }) => ({
    course: one(coursesTable, {
      fields: [assignedCoursesTable.courseId],
      references: [coursesTable.id],
    }),
    user: one(usersTable, {
      fields: [assignedCoursesTable.userId],
      references: [usersTable.id],
    }),
    organization: one(organizationsTable, {
      fields: [assignedCoursesTable.organizationId],
      references: [organizationsTable.id],
    }),
  })
);

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

export const verifiedUsersRelations = relations(
  verifiedUsersTable,
  ({ one }) => ({
    organization: one(organizationsTable, {
      fields: [verifiedUsersTable.organizationId],
      references: [organizationsTable.id],
    }),
  })
);
