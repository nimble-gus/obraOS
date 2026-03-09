-- AlterTable
ALTER TABLE `CatalogoMaterial` ADD COLUMN `presupuesto_asignado` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Proyecto` ADD COLUMN `presupuesto_total` DOUBLE NULL;

-- CreateTable
CREATE TABLE `Tarea` (
    `id` VARCHAR(191) NOT NULL,
    `fase_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Tarea_fase_id_idx`(`fase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TareaCompletadaUnidad` (
    `tarea_id` VARCHAR(191) NOT NULL,
    `unidad_id` VARCHAR(191) NOT NULL,
    `completada_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TareaCompletadaUnidad_unidad_id_idx`(`unidad_id`),
    PRIMARY KEY (`tarea_id`, `unidad_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tarea` ADD CONSTRAINT `Tarea_fase_id_fkey` FOREIGN KEY (`fase_id`) REFERENCES `Fase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TareaCompletadaUnidad` ADD CONSTRAINT `TareaCompletadaUnidad_tarea_id_fkey` FOREIGN KEY (`tarea_id`) REFERENCES `Tarea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TareaCompletadaUnidad` ADD CONSTRAINT `TareaCompletadaUnidad_unidad_id_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
