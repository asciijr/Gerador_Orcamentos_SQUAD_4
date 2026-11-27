ALTER TABLE "budgets"
  ADD COLUMN "contingency_percent" DECIMAL(5,2),
  ADD COLUMN "contribution_percent" DECIMAL(5,2),
  ADD COLUMN "base_cost" DECIMAL(14,2),
  ADD COLUMN "contingency_value" DECIMAL(14,2),
  ADD COLUMN "contribution_value" DECIMAL(14,2);

UPDATE "budgets"
SET
  "contingency_percent" = 0,
  "contribution_percent" = 0,
  "base_cost" = "total_cost",
  "contingency_value" = 0,
  "contribution_value" = 0;

ALTER TABLE "budgets"
  ALTER COLUMN "contingency_percent" SET NOT NULL,
  ALTER COLUMN "contribution_percent" SET NOT NULL,
  ALTER COLUMN "base_cost" SET NOT NULL,
  ALTER COLUMN "contingency_value" SET NOT NULL,
  ALTER COLUMN "contribution_value" SET NOT NULL;

ALTER TABLE "budgets"
  DROP COLUMN "margin_percent",
  DROP COLUMN "total_cost",
  DROP COLUMN "margin_value";
