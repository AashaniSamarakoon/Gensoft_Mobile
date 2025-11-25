-- AlterTable
ALTER TABLE `mobile_app_users` ADD COLUMN `isLoggedOut` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastLogoutAt` DATETIME(3) NULL;
