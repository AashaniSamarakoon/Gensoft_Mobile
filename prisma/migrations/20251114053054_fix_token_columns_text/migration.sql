-- DropIndex
DROP INDEX `refresh_tokens_token_key` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `user_sessions_accessToken_key` ON `user_sessions`;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `token` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `user_sessions` MODIFY `accessToken` TEXT NOT NULL;
