-- CreateTable
CREATE TABLE "budgets" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "client_name" VARCHAR(150) NOT NULL,
    "project_name" VARCHAR(150) NOT NULL,
    "hours" DECIMAL(10,2) NOT NULL,
    "hourly_rate" DECIMAL(12,2) NOT NULL,
    "extra_expenses" DECIMAL(12,2) NOT NULL,
    "margin_percent" DECIMAL(5,2) NOT NULL,
    "labor_cost" DECIMAL(14,2) NOT NULL,
    "total_cost" DECIMAL(14,2) NOT NULL,
    "margin_value" DECIMAL(14,2) NOT NULL,
    "final_price" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budgets_number_key" ON "budgets"("number");

-- CreateIndex
CREATE INDEX "budgets_client_name_idx" ON "budgets"("client_name");

-- CreateIndex
CREATE INDEX "budgets_created_at_idx" ON "budgets"("created_at");
