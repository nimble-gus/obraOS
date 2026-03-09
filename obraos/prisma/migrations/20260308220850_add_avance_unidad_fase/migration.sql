-- CreateTable
CREATE TABLE `AvanceUnidadFase` (
    `id` VARCHAR(191) NOT NULL,
    `unidad_id` VARCHAR(191) NOT NULL,
    `fase_id` VARCHAR(191) NOT NULL,
    `pct_avance` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'ACTIVE', 'DONE') NOT NULL DEFAULT 'PENDING',
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `AvanceUnidadFase_unidad_id_idx`(`unidad_id`),
    INDEX `AvanceUnidadFase_fase_id_idx`(`fase_id`),
    UNIQUE INDEX `AvanceUnidadFase_unidad_id_fase_id_key`(`unidad_id`, `fase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AvanceUnidadFase` ADD CONSTRAINT `AvanceUnidadFase_unidad_id_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvanceUnidadFase` ADD CONSTRAINT `AvanceUnidadFase_fase_id_fkey` FOREIGN KEY (`fase_id`) REFERENCES `Fase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
