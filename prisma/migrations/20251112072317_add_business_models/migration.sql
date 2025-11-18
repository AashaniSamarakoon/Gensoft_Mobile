-- CreateTable
CREATE TABLE `proofs` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NULL,
    `notes` TEXT NULL,
    `attachments` TEXT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `userId` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NULL,
    `jobNumber` VARCHAR(191) NULL,
    `customer` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settlements` (
    `id` VARCHAR(191) NOT NULL,
    `payee` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NULL,
    `jobNumber` VARCHAR(191) NULL,
    `customer` VARCHAR(191) NULL,
    `refNo` VARCHAR(191) NOT NULL,
    `iouAmount` DECIMAL(10, 2) NOT NULL,
    `returnAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `utilized` DECIMAL(10, 2) NOT NULL,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `vat` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `costCenter` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID') NOT NULL DEFAULT 'DRAFT',
    `userId` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `submittedAt` DATETIME(3) NULL,
    `approvedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approvals` (
    `id` VARCHAR(191) NOT NULL,
    `itemType` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `amount` DECIMAL(10, 2) NULL,
    `requestedBy` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `approvedBy` VARCHAR(191) NULL,
    `comments` TEXT NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'TODO',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `category` VARCHAR(191) NULL,
    `assignedTo` VARCHAR(191) NULL,
    `assignedBy` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `estimatedHours` INTEGER NULL,
    `actualHours` INTEGER NULL,
    `jobNumber` VARCHAR(191) NULL,
    `customer` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `coordinates` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
