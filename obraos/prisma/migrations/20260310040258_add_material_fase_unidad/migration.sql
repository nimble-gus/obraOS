-- CreateTable
CREATE TABLE `MaterialFaseUnidad` (
    `id` VARCHAR(191) NOT NULL,
    `material_fase_id` VARCHAR(191) NOT NULL,
    `unidad_id` VARCHAR(191) NOT NULL,
    `porcentaje` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `MaterialFaseUnidad_material_fase_id_idx`(`material_fase_id`),
    INDEX `MaterialFaseUnidad_unidad_id_idx`(`unidad_id`),
    UNIQUE INDEX `MaterialFaseUnidad_material_fase_id_unidad_id_key`(`material_fase_id`, `unidad_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaterialFaseUnidad` ADD CONSTRAINT `MaterialFaseUnidad_material_fase_id_fkey` FOREIGN KEY (`material_fase_id`) REFERENCES `MaterialFase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialFaseUnidad` ADD CONSTRAINT `MaterialFaseUnidad_unidad_id_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
