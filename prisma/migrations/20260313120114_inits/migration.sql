/*
  Warnings:

  - A unique constraint covering the columns `[mainRoleId,code]` on the table `SubRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `SubRole_name_mainRoleId_code_key` ON `subrole`;

-- CreateIndex
CREATE UNIQUE INDEX `SubRole_mainRoleId_code_key` ON `SubRole`(`mainRoleId`, `code`);
