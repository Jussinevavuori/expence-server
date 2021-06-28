# Migration `20210628115545-updates`

This migration has been generated by Jussi at 6/28/2021, 2:55:45 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "stripe_prices" DROP CONSTRAINT "stripe_prices_product_id_fkey"

ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_uid_fkey"

CREATE TABLE "premium_subscriptions" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
)

DROP TABLE "stripe_prices"

DROP TABLE "stripe_products"

DROP TABLE "subscriptions"

CREATE UNIQUE INDEX "premium_subscriptions.uid_unique" ON "premium_subscriptions"("uid")

ALTER TABLE "premium_subscriptions" ADD FOREIGN KEY("uid")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210628111110-premium_subscription..20210628115545-updates
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource postgresql {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
   id               String   @id @default(uuid())
@@ -194,4 +194,12 @@
   updatedAt              DateTime @default(now()) @updatedAt @map("updated_at")
   @@map(name: "premium_prices")
 }
+
+
+
+// @DEPRECATED
+enum SubscribableProduct {
+  PREMIUM
+}
+
```

