-- CreateTable
CREATE TABLE `InventarioMovimiento` (
    `id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ENTRADA', 'SALIDA') NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `saldo_antes` INTEGER NULL,
    `saldo_despues` INTEGER NULL,
    `unidad_id` VARCHAR(191) NULL,
    `fase_id` VARCHAR(191) NULL,
    `material_fase_id` VARCHAR(191) NULL,
    `proyecto_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InventarioMovimiento_material_id_idx`(`material_id`),
    INDEX `InventarioMovimiento_created_at_idx`(`created_at`),
    INDEX `InventarioMovimiento_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InventarioMovimiento` ADD CONSTRAINT `InventarioMovimiento_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `CatalogoMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventarioMovimiento` ADD CONSTRAINT `InventarioMovimiento_unidad_id_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
