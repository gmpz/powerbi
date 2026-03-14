/*
  Warnings:

  - You are about to alter the column `type` on the `mainrole` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(5))`.
  - You are about to alter the column `type` on the `subrole` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `Enum(EnumId(5))`.

*/
-- AlterTable
ALTER TABLE `mainrole` MODIFY `type` ENUM('SYSTEM', 'DASHBOARD') NOT NULL DEFAULT 'DASHBOARD';

-- AlterTable
ALTER TABLE `subrole` MODIFY `type` ENUM('SYSTEM', 'DASHBOARD') NOT NULL DEFAULT 'DASHBOARD';
