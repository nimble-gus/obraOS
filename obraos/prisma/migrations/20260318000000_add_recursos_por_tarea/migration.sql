-- CreateTable LoteMaterial
CREATE TABLE `LoteMaterial` (
    `id` VARCHAR(191) NOT NULL,
    `catalogo_material_id` VARCHAR(191) NOT NULL,
    `proyecto_id` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `cantidad_inicial` DOUBLE NOT NULL,
    `precio_unitario` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `LoteMaterial_catalogoMaterialId_idx`(`catalogo_material_id`),
    INDEX `LoteMaterial_proyectoId_idx`(`proyecto_id`),
    CONSTRAINT `LoteMaterial_catalogoMaterialId_fkey` FOREIGN KEY (`catalogo_material_id`) REFERENCES `CatalogoMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `LoteMaterial_proyectoId_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable MaterialAsignadoTarea
CREATE TABLE `MaterialAsignadoTarea` (
    `id` VARCHAR(191) NOT NULL,
    `lote_id` VARCHAR(191) NOT NULL,
    `tarea_id` VARCHAR(191) NOT NULL,
    `unidad_id` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `monto` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `MaterialAsignadoTarea_loteId_idx`(`lote_id`),
    INDEX `MaterialAsignadoTarea_tareaId_idx`(`tarea_id`),
    INDEX `MaterialAsignadoTarea_unidadId_idx`(`unidad_id`),
    CONSTRAINT `MaterialAsignadoTarea_loteId_fkey` FOREIGN KEY (`lote_id`) REFERENCES `LoteMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `MaterialAsignadoTarea_tareaId_fkey` FOREIGN KEY (`tarea_id`) REFERENCES `Tarea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `MaterialAsignadoTarea_unidadId_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable PlanillaAsignadaTarea
CREATE TABLE `PlanillaAsignadaTarea` (
    `id` VARCHAR(191) NOT NULL,
    `planilla_id` VARCHAR(191) NOT NULL,
    `tarea_id` VARCHAR(191) NOT NULL,
    `unidad_id` VARCHAR(191) NOT NULL,
    `monto` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `PlanillaAsignadaTarea_planillaId_idx`(`planilla_id`),
    INDEX `PlanillaAsignadaTarea_tareaId_idx`(`tarea_id`),
    INDEX `PlanillaAsignadaTarea_unidadId_idx`(`unidad_id`),
    CONSTRAINT `PlanillaAsignadaTarea_planillaId_fkey` FOREIGN KEY (`planilla_id`) REFERENCES `Planilla`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `PlanillaAsignadaTarea_tareaId_fkey` FOREIGN KEY (`tarea_id`) REFERENCES `Tarea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `PlanillaAsignadaTarea_unidadId_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable ServicioAsignadoTarea
CREATE TABLE `ServicioAsignadoTarea` (
    `id` VARCHAR(191) NOT NULL,
    `servicio_id` VARCHAR(191) NOT NULL,
    `tarea_id` VARCHAR(191) NOT NULL,
    `unidad_id` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `monto` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `ServicioAsignadoTarea_servicioId_idx`(`servicio_id`),
    INDEX `ServicioAsignadoTarea_tareaId_idx`(`tarea_id`),
    INDEX `ServicioAsignadoTarea_unidadId_idx`(`unidad_id`),
    CONSTRAINT `ServicioAsignadoTarea_servicioId_fkey` FOREIGN KEY (`servicio_id`) REFERENCES `CatalogoServicio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ServicioAsignadoTarea_tareaId_fkey` FOREIGN KEY (`tarea_id`) REFERENCES `Tarea`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ServicioAsignadoTarea_unidadId_fkey` FOREIGN KEY (`unidad_id`) REFERENCES `Unidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
