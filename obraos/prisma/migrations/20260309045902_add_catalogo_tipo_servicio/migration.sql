-- AlterTable
ALTER TABLE `CatalogoServicio` ADD COLUMN `tipo_servicio_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CatalogoTipoServicio` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `CatalogoTipoServicio_orden_idx`(`orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CatalogoServicio_tipo_servicio_id_idx` ON `CatalogoServicio`(`tipo_servicio_id`);

-- AddForeignKey
ALTER TABLE `CatalogoServicio` ADD CONSTRAINT `CatalogoServicio_tipo_servicio_id_fkey` FOREIGN KEY (`tipo_servicio_id`) REFERENCES `CatalogoTipoServicio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
