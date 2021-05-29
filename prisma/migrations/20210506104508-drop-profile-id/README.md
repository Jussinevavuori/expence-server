# Migration `20210506104508-drop-profile-id`

This migration has been generated by Jussi at 5/6/2021, 1:45:08 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey",
DROP COLUMN "id",
ADD PRIMARY KEY ("uid")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210506104405-auto-generate-profile-id..20210506104508-drop-profile-id
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
@@ -50,10 +50,9 @@
   @@map(name: "users")
 }
 model Profile {
-  id          String  @id @default(uuid())
-  uid         String
+  uid         String  @id
   displayName String? @map("display_name")
   photoUrl    String? @map("photo_url")
   themeColor  String? @map("theme_color")
   themeMode   String? @map("theme_mode")
```

