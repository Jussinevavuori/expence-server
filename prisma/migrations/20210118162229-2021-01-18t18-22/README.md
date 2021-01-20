# Migration `20210118162229-2021-01-18t18-22`

This migration has been generated by Jussi at 1/18/2021, 6:22:29 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "transactions" DROP COLUMN "category",
ADD COLUMN     "category_id" TEXT

CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "income_icon" TEXT NOT NULL DEFAULT E'💰',
    "expense_icon" TEXT NOT NULL DEFAULT E'💸',

    PRIMARY KEY ("id")
)

CREATE UNIQUE INDEX "categories.value_unique" ON "categories"("value")

ALTER TABLE "categories" ADD FOREIGN KEY("uid")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "transactions" ADD FOREIGN KEY("category_id")REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200903094505-init..20210118162229-2021-01-18t18-22
--- datamodel.dml
+++ datamodel.dml
@@ -3,34 +3,47 @@
 }
 datasource postgresql {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model Transaction {
-  id            String   @id @default(uuid())
+  id            String    @id @default(uuid())
   uid           String
-  user          User     @relation(fields: [uid], references: [id])
-  integerAmount Int      @map("integer_amount")
-  category      String
+  categoryId    String?   @map("category_id")
+  integerAmount Int       @map("integer_amount")
   time          DateTime
   comment       String?
+  user          User      @relation(fields: [uid], references: [id])
+  category      Category? @relation(fields: [categoryId], references: [id])
   @@map(name: "transactions")
 }
 model User {
-
-  id            String        @id @default(uuid())
-  email         String?       @unique
-  emailVerified Boolean       @default(false) @map("email_verified")
-  displayName   String?       @map("display_name")
+  id            String  @id @default(uuid())
+  email         String? @unique
+  emailVerified Boolean @default(false) @map("email_verified")
+  displayName   String? @map("display_name")
   password      String?
-  googleId      String?       @unique @map("google_id")
-  photoUrl      String?       @map("photo_url")
-  tokenVersion  Int           @default(1) @map("token_version")
-  disabled      Boolean       @default(false)
-  transactions  Transaction[]
+  googleId      String? @unique @map("google_id")
+  photoUrl      String? @map("photo_url")
+  tokenVersion  Int     @default(1) @map("token_version")
+  disabled      Boolean @default(false)
+  transactions Transaction[]
+  categories   Category[]
   @@map(name: "users")
 }
+
+model Category {
+  id          String @id @default(uuid())
+  uid         String
+  value       String @unique
+  incomeIcon  String @default("💰") @map("income_icon")
+  expenseIcon String @default("💸") @map("expense_icon")
+  user        User   @relation(fields: [uid], references: [id])
+
+  Transaction Transaction[]
+  @@map(name: "categories")
+}
```

