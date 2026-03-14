/*
  Warnings:

  - A unique constraint covering the columns `[name,dashboardId,code]` on the table `MainRole` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,mainRoleId,code]` on the table `SubRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `MainRole_name_dashboardId_key` ON `mainrole`;

-- DropIndex
DROP INDEX `SubRole_name_mainRoleId_key` ON `subrole`;

-- CreateIndex
CREATE UNIQUE INDEX `MainRole_name_dashboardId_code_key` ON `MainRole`(`name`, `dashboardId`, `code`);

-- CreateIndex
CREATE UNIQUE INDEX `SubRole_name_mainRoleId_code_key` ON `SubRole`(`name`, `mainRoleId`, `code`);
