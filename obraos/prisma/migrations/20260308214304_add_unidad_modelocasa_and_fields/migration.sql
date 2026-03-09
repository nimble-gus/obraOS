-- AlterTable
ALTER TABLE `Fase` ADD COLUMN `partes_visibles` JSON NULL;

-- AlterTable: renombrar cantidad -> cantidad_requerida (preserva datos)
ALTER TABLE `MaterialFase` CHANGE COLUMN `cantidad` `cantidad_requerida` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Proyecto` ADD COLUMN `fecha_entrega_estimada` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('PLANIFICACION', 'ACTIVO', 'PAUSADO', 'ENTREGADO') NOT NULL DEFAULT 'ACTIVO';

-- CreateTable
CREATE TABLE `Unidad` (
    `id` VARCHAR(191) NOT NULL,
    `proyecto_id` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `etiqueta` VARCHAR(191) NOT NULL,
    `modelo_casa_id` VARCHAR(191) NULL,
    `fase_actual_id` VARCHAR(191) NULL,
    `pct_avance_global` DOUBLE NOT NULL DEFAULT 0,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Unidad_proyecto_id_idx`(`proyecto_id`),
    INDEX `Unidad_modelo_casa_id_idx`(`modelo_casa_id`),
    INDEX `Unidad_fase_actual_id_idx`(`fase_actual_id`),
    UNIQUE INDEX `Unidad_proyecto_id_numero_key`(`proyecto_id`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModeloCasa` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `ancho_exterior` DOUBLE NOT NULL DEFAULT 10,
    `profundidad_exterior` DOUBLE NOT NULL DEFAULT 8,
    `altura_paredes` DOUBLE NOT NULL DEFAULT 5,
    `grosor_muro` DOUBLE NOT NULL DEFAULT 0.3,
    `tipo_techo` ENUM('PIRAMIDAL', 'PLANO', 'DOS_AGUAS') NOT NULL DEFAULT 'PIRAMIDAL',
    `num_ventanas_front` INTEGER NOT NULL DEFAULT 2,
    `num_ventanas_side` INTEGER NOT NULL DEFAULT 1,
    `tiene_puerta` BOOLEAN NOT NULL DEFAULT true,
    `config_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ModeloCasa_nombre_idx`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Unidad` ADD CONSTRAINT `Unidad_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unidad` ADD CONSTRAINT `Unidad_modelo_casa_id_fkey` FOREIGN KEY (`modelo_casa_id`) REFERENCES `ModeloCasa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unidad` ADD CONSTRAINT `Unidad_fase_actual_id_fkey` FOREIGN KEY (`fase_actual_id`) REFERENCES `Fase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
