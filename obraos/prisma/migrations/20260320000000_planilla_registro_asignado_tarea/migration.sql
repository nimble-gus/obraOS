-- AlterTable PlanillaRegistro: migrar a nuevo esquema (nombre, unidad, tarifa)
-- Primero agregar columnas nuevas
ALTER TABLE `PlanillaRegistro` ADD COLUMN `nombre` VARCHAR(191) NULL, ADD COLUMN `unidad` ENUM('DIA', 'M2', 'M3') NULL, ADD COLUMN `tarifa` DOUBLE NULL, ADD COLUMN `created_at` DATETIME(3) NULL;

-- Migrar datos existentes (si los hay)
UPDATE `PlanillaRegistro` SET `nombre` = COALESCE(`nombre_persona`, ''), `tarifa` = COALESCE(`tarifa_dia`, 0), `unidad` = 'DIA', `created_at` = CURRENT_TIMESTAMP(3) WHERE `nombre` IS NULL;

-- Eliminar columnas antiguas
ALTER TABLE `PlanillaRegistro` DROP COLUMN `nombre_persona`, DROP COLUMN `tarifa_dia`, DROP COLUMN `dias_trabajados`, DROP COLUMN `horas_extras`, DROP COLUMN `tarifa_hora_extra`, DROP COLUMN `total`;

-- Hacer NOT NULL las columnas requeridas
ALTER TABLE `PlanillaRegistro` MODIFY COLUMN `nombre` VARCHAR(191) NOT NULL, MODIFY COLUMN `unidad` ENUM('DIA', 'M2', 'M3') NOT NULL, MODIFY COLUMN `tarifa` DOUBLE NOT NULL, MODIFY COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable PlanillaRegistroAsignadoTarea
CREATE TABLE `PlanillaRegistroAsignadoTarea` (
    `id` VARCHAR(191) NOT NULL,
    `planilla_registro_id` VARCHAR(191) NOT NULL,
    `tarea_id` VARCHAR(191) NOT NULL,
    `unidad_id` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `monto` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlanillaRegistroAsignadoTarea_planilla_registro_id_idx`(`planilla_registro_id`),
    INDEX `PlanillaRegistroAsignadoTarea_tarea_id_idx`(`tarea_id`),
    INDEX `PlanillaRegistroAsignadoTarea_unidad_id_idx`(`unidad_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `PlanillaRegistroAsignadoTarea_planilla_registro_id_fkey` FOREIGN KEY (`planilla_registro_id`) REFERENCES `PlanillaRegistro`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `PlanillaRegistroAsignadoTarea_tarea_id_fkey` FOREIGN KEY (`tarea_id`) REFERENCES `Tarea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `PlanillaRegistroAsignadoTarea_unidad_id_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
