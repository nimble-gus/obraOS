-- CreateTable
CREATE TABLE `Planilla` (
    `id` VARCHAR(191) NOT NULL,
    `proyecto_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `periodo` VARCHAR(191) NULL,
    `fecha_pago` DATETIME(3) NULL,
    `estado` ENUM('BORRADOR', 'PAGADA') NOT NULL DEFAULT 'BORRADOR',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Planilla_proyecto_id_idx`(`proyecto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanillaRegistro` (
    `id` VARCHAR(191) NOT NULL,
    `planilla_id` VARCHAR(191) NOT NULL,
    `nombre_persona` VARCHAR(191) NOT NULL,
    `tarifa_dia` DOUBLE NOT NULL,
    `dias_trabajados` INTEGER NOT NULL,
    `horas_extras` INTEGER NOT NULL DEFAULT 0,
    `tarifa_hora_extra` DOUBLE NULL,
    `total` DOUBLE NOT NULL,

    INDEX `PlanillaRegistro_planilla_id_idx`(`planilla_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanillaAsignadaFase` (
    `id` VARCHAR(191) NOT NULL,
    `planilla_id` VARCHAR(191) NOT NULL,
    `fase_id` VARCHAR(191) NOT NULL,
    `monto` DOUBLE NOT NULL,

    INDEX `PlanillaAsignadaFase_planilla_id_idx`(`planilla_id`),
    INDEX `PlanillaAsignadaFase_fase_id_idx`(`fase_id`),
    UNIQUE INDEX `PlanillaAsignadaFase_planilla_id_fase_id_key`(`planilla_id`, `fase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CatalogoServicio` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `costo_unitario` DOUBLE NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `CatalogoServicio_nombre_idx`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServicioFase` (
    `id` VARCHAR(191) NOT NULL,
    `fase_id` VARCHAR(191) NOT NULL,
    `servicio_id` VARCHAR(191) NOT NULL,
    `cantidad_requerida` INTEGER NOT NULL,

    INDEX `ServicioFase_fase_id_idx`(`fase_id`),
    INDEX `ServicioFase_servicio_id_idx`(`servicio_id`),
    UNIQUE INDEX `ServicioFase_fase_id_servicio_id_key`(`fase_id`, `servicio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Planilla` ADD CONSTRAINT `Planilla_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanillaRegistro` ADD CONSTRAINT `PlanillaRegistro_planilla_id_fkey` FOREIGN KEY (`planilla_id`) REFERENCES `Planilla`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanillaAsignadaFase` ADD CONSTRAINT `PlanillaAsignadaFase_planilla_id_fkey` FOREIGN KEY (`planilla_id`) REFERENCES `Planilla`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanillaAsignadaFase` ADD CONSTRAINT `PlanillaAsignadaFase_fase_id_fkey` FOREIGN KEY (`fase_id`) REFERENCES `Fase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicioFase` ADD CONSTRAINT `ServicioFase_fase_id_fkey` FOREIGN KEY (`fase_id`) REFERENCES `Fase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicioFase` ADD CONSTRAINT `ServicioFase_servicio_id_fkey` FOREIGN KEY (`servicio_id`) REFERENCES `CatalogoServicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
