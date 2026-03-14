/*
  Warnings:

  - Made the column `code` on table `mainrole` required. This step will fail if there are existing NULL values in that column.
  - Made the column `code` on table `subrole` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `mainrole` MODIFY `code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `subrole` MODIFY `code` INTEGER UNSIGNED NOT NULL;
