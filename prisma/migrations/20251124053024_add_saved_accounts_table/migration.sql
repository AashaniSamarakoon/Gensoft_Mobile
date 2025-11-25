-- CreateTable
CREATE TABLE `saved_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `deviceName` VARCHAR(191) NULL,
    `deviceType` VARCHAR(191) NULL,
    `deviceOS` VARCHAR(191) NULL,
    `appVersion` VARCHAR(191) NULL,
    `firstSavedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastAccessedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accessCount` INTEGER NOT NULL DEFAULT 1,
    `biometricEnabled` BOOLEAN NOT NULL DEFAULT false,
    `quickLoginEnabled` BOOLEAN NOT NULL DEFAULT true,
    `lastTokenRefresh` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `userAgent` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `saved_accounts_userId_deviceId_key`(`userId`, `deviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `saved_accounts` ADD CONSTRAINT `saved_accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `mobile_app_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
