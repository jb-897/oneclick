import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  date,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const eventSessions = pgTable("event_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  place: text("place").notNull(),
  totalSpots: integer("total_spots").notNull(),
  utilities: text("utilities").array().notNull(),
  description: text("description"),
  level: text("level"),
  tags: text("tags").array().notNull(),
  registrationOpen: boolean("registration_open").notNull().default(true),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => eventSessions.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    surname: text("surname").notNull(),
    year: text("year").notNull(),
    group: text("group").notNull(),
    university: text("university").notNull(),
    hasCodingExperience: boolean("has_coding_experience").notNull(),
    status: text("status", {
      enum: ["PENDING_CONFIRMATION", "CONFIRMED", "CANCELLED", "EXPIRED"],
    })
      .notNull()
      .default("PENDING_CONFIRMATION"),
    confirmationTokenHash: text("confirmation_token_hash"),
    confirmationTokenExpiresAt: timestamp("confirmation_token_expires_at", {
      withTimezone: true,
    }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique("registrations_session_email").on(t.sessionId, t.email),
    index("registrations_confirmation_token_hash").on(t.confirmationTokenHash),
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [{ index: [t.entityType, t.entityId] }]
);

export type EventSession = typeof eventSessions.$inferSelect;
export type NewEventSession = typeof eventSessions.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export const REGISTRATION_STATUS = {
  PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];
