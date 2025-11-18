-- AlterTable
ALTER TABLE `approvals` ADD COLUMN `blNo` VARCHAR(191) NULL,
    ADD COLUMN `customerPayee` VARCHAR(191) NULL,
    ADD COLUMN `invNo` VARCHAR(191) NULL,
    ADD COLUMN `jobNumber` VARCHAR(191) NULL,
    ADD COLUMN `moduleId` VARCHAR(191) NULL,
    ADD COLUMN `refNo` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `modules` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `modules_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
