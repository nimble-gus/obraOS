-- CreateTable PlanillaAsignadaTarea (asignación por bloque: suma tarifas × cantidad)
CREATE TABLE `PlanillaAsignadaTarea` (
    `id` VARCHAR(191) NOT NULL,
    `planilla_id` VARCHAR(191) NOT NULL,
    `tarea_id` VARCHAR(191) NOT NULL,
    `unidad_id` VARCHAR(191) NOT NULL,
    `unidad_tipo` ENUM('DIA', 'M2', 'M3') NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `monto` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlanillaAsignadaTarea_planilla_id_idx`(`planilla_id`),
    INDEX `PlanillaAsignadaTarea_tarea_id_idx`(`tarea_id`),
    INDEX `PlanillaAsignadaTarea_unidad_id_idx`(`unidad_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `PlanillaAsignadaTarea_planilla_id_fkey` FOREIGN KEY (`planilla_id`) REFERENCES `Planilla`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `PlanillaAsignadaTarea_tarea_id_fkey` FOREIGN KEY (`tarea_id`) REFERENCES `Tarea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `PlanillaAsignadaTarea_unidad_id_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
