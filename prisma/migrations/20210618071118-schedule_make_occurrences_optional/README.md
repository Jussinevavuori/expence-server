# Migration `20210618071118-schedule_make_occurrences_optional`

This migration has been generated by Jussi at 6/18/2021, 10:11:19 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "transaction_schedules" ALTER COLUMN "occurrences" DROP NOT NULL
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210618064827-update_schedule_transactions_field_name..20210618071118-schedule_make_occurrences_optional
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource postgresql {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 // Each user is connected to a user account, which contains their ID, login
 // details and other authentication details. The user account may also specify
@@ -86,9 +86,9 @@
   integerAmount   Int          @map("integer_amount")
   intervalType    IntervalType @map("interval_type")
   intervalLength  Int          @map("interval_length")
   firstOccurrence DateTime     @map("first_occurrence")
-  occurrences     Int
+  occurrences     Int?
   createdAt       DateTime     @default(now()) @map("created_at")
   updatedAt       DateTime     @default(now()) @updatedAt @map("updated_at")
   User         User          @relation(fields: [uid], references: [id])
```

