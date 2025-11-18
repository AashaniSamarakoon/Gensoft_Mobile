-- DropForeignKey
ALTER TABLE `ious` DROP FOREIGN KEY `ious_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `ious` DROP FOREIGN KEY `ious_receivedById_fkey`;

-- DropIndex
DROP INDEX `ious_createdById_fkey` ON `ious`;

-- DropIndex
DROP INDEX `ious_receivedById_fkey` ON `ious`;

-- AddForeignKey
ALTER TABLE `ious` ADD CONSTRAINT `ious_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `mobile_app_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ious` ADD CONSTRAINT `ious_receivedById_fkey` FOREIGN KEY (`receivedById`) REFERENCES `mobile_app_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
