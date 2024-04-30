/*
  Warnings:

  - You are about to drop the column `permissionId` on the `user_permissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId]` on the table `role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user_permissions` DROP FOREIGN KEY `user_permissions_permissionId_fkey`;

-- AlterTable
ALTER TABLE `permission` ADD COLUMN `userPermissionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `role` ADD COLUMN `profileId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user_permissions` DROP COLUMN `permissionId`;

-- CreateIndex
CREATE UNIQUE INDEX `role_profileId_key` ON `role`(`profileId`);

-- AddForeignKey
ALTER TABLE `permission` ADD CONSTRAINT `permission_userPermissionId_fkey` FOREIGN KEY (`userPermissionId`) REFERENCES `user_permissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
