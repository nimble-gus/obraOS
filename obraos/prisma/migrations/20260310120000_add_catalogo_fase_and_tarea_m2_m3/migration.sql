-- CreateTable
CREATE TABLE `CatalogoFase` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `CatalogoFase_orden_idx`(`orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Fase` ADD COLUMN `catalogo_fase_id` VARCHAR(191) NULL;

-- AlterTable (fecha_inicio y fecha_fin ya existen; solo agregamos cantidad_m2 y cantidad_m3)
ALTER TABLE `Tarea` ADD COLUMN `cantidad_m2` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `cantidad_m3` DOUBLE NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Fase_catalogo_fase_id_idx` ON `Fase`(`catalogo_fase_id`);

-- AddForeignKey
ALTER TABLE `Fase` ADD CONSTRAINT `Fase_catalogo_fase_id_fkey` FOREIGN KEY (`catalogo_fase_id`) REFERENCES `CatalogoFase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
