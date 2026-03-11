/*
  Warnings:

  - You are about to drop the column `accessCrtl` on the `dashboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `dashboard` DROP COLUMN `accessCrtl`,
    ADD COLUMN `accessCtrl` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';
