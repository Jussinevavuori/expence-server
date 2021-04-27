# Migration `20210420094130-log-optional-user`

This migration has been generated by Jussi at 4/20/2021, 12:41:30 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "Log" ALTER COLUMN "uid" DROP NOT NULL
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210420094011-logs..20210420094130-log-optional-user
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource postgresql {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model Transaction {
   id            String   @id @default(uuid())
@@ -100,9 +100,9 @@
 }
 model Log {
   id         String   @id @default(uuid())
-  uid        String
+  uid        String?
   type       String
   message    String
   data       String
   stackTrace String   @map("stack_trace")
@@ -111,6 +111,6 @@
   timestring String
   createdAt  DateTime @default(now()) @map("created_at")
   href       String
-  User User @relation(fields: [uid], references: [id])
+  User User? @relation(fields: [uid], references: [id])
 }
```

