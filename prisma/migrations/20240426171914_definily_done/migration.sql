/*
  Warnings:

  - You are about to drop the column `inheritance` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `permissionId` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `permitted` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `rolePermissionId` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `userRoleId` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the `permission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `permission` to the `user_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resourceId` to the `user_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `permission` DROP FOREIGN KEY `permission_resourceId_fkey`;

-- DropForeignKey
ALTER TABLE `permission` DROP FOREIGN KEY `permission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `permission` DROP FOREIGN KEY `permission_userPermissionId_fkey`;

-- DropForeignKey
ALTER TABLE `user_permissions` DROP FOREIGN KEY `user_permissions_userRoleId_fkey`;

-- AlterTable
ALTER TABLE `user_permissions` DROP COLUMN `inheritance`,
    DROP COLUMN `permissionId`,
    DROP COLUMN `permitted`,
    DROP COLUMN `rolePermissionId`,
    DROP COLUMN `userRoleId`,
    ADD COLUMN `permission` ENUM('PERMITTED', 'NOTPERMITTED', 'DENY') NOT NULL,
    ADD COLUMN `resourceId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `permission`;

-- CreateTable
CREATE TABLE `role_permission` (
    `id` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NOT NULL,
    `permission` ENUM('PERMITTED', 'NOTPERMITTED', 'DENY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `roleId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_resourceId_fkey` FOREIGN KEY (`resourceId`) REFERENCES `resource`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_resourceId_fkey` FOREIGN KEY (`resourceId`) REFERENCES `resource`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
