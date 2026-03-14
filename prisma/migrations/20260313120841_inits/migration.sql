/*
  Warnings:

  - A unique constraint covering the columns `[dashboardId,code]` on the table `MainRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `MainRole_name_dashboardId_code_key` ON `mainrole`;

-- CreateIndex
CREATE UNIQUE INDEX `MainRole_dashboardId_code_key` ON `MainRole`(`dashboardId`, `code`);
