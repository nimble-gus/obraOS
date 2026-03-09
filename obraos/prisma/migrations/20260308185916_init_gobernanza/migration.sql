-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'GERENCIA', 'PROJECT_MANAGER', 'SUPERVISOR') NOT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO') NOT NULL DEFAULT 'ACTIVO',
    `avatar_url` VARCHAR(191) NULL,
    `ultimo_acceso` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `creado_por_id` VARCHAR(191) NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` ENUM('ADMIN', 'GERENCIA', 'PROJECT_MANAGER', 'SUPERVISOR') NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,

    UNIQUE INDEX `Rol_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permiso` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `modulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,

    UNIQUE INDEX `Permiso_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolPermiso` (
    `rolId` VARCHAR(191) NOT NULL,
    `permisoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`rolId`, `permisoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfiguracionPlataforma` (
    `id` VARCHAR(191) NOT NULL,
    `clave` VARCHAR(191) NOT NULL,
    `valor` TEXT NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'string',
    `categoria` VARCHAR(191) NOT NULL DEFAULT 'general',
    `descripcion` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ConfiguracionPlataforma_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContenidoPlataforma` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NULL,
    `cuerpo` LONGTEXT NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContenidoPlataforma_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NULL,
    `accion` VARCHAR(191) NOT NULL,
    `modulo` VARCHAR(191) NOT NULL,
    `entidad_id` VARCHAR(191) NULL,
    `detalles` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proyecto` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` ENUM('RESIDENCIAL', 'APARTAMENTOS', 'VILLAS', 'CONDOMINIO', 'COMERCIAL') NOT NULL,
    `ubicacion` VARCHAR(191) NOT NULL,
    `num_unidades` INTEGER NOT NULL,
    `pm_asignado_id` VARCHAR(191) NOT NULL,
    `precio_venta` DOUBLE NOT NULL,
    `margen_objetivo` DOUBLE NOT NULL,
    `pct_costos_indirectos` DOUBLE NOT NULL,
    `pct_contingencia` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fase` (
    `id` VARCHAR(191) NOT NULL,
    `proyecto_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'DONE') NOT NULL DEFAULT 'PENDING',
    `pct_avance` INTEGER NOT NULL DEFAULT 0,
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin` DATETIME(3) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Fase_proyecto_id_idx`(`proyecto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialFase` (
    `id` VARCHAR(191) NOT NULL,
    `fase_id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `pct_ejecutado` INTEGER NOT NULL DEFAULT 0,

    INDEX `MaterialFase_fase_id_idx`(`fase_id`),
    INDEX `MaterialFase_material_id_idx`(`material_id`),
    UNIQUE INDEX `MaterialFase_fase_id_material_id_key`(`fase_id`, `material_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CatalogoMaterial` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `categoria` ENUM('MAMPOSTERIA', 'CIMENTACION', 'ESTRUCTURA', 'ACABADOS', 'MEZCLAS', 'INSTALACIONES') NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `stock_total` INTEGER NOT NULL DEFAULT 0,
    `costo_unitario` DOUBLE NOT NULL,
    `color_hex` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `CatalogoMaterial_categoria_idx`(`categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FaseParte3D` (
    `faseId` VARCHAR(191) NOT NULL,
    `parteId` VARCHAR(191) NOT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NULL,

    PRIMARY KEY (`faseId`, `parteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parte3D` (
    `id` VARCHAR(191) NOT NULL,
    `proyecto_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL,
    `geometria` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Parte3D_proyecto_id_idx`(`proyecto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_creado_por_id_fkey` FOREIGN KEY (`creado_por_id`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolPermiso` ADD CONSTRAINT `RolPermiso_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolPermiso` ADD CONSTRAINT `RolPermiso_permisoId_fkey` FOREIGN KEY (`permisoId`) REFERENCES `Permiso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proyecto` ADD CONSTRAINT `Proyecto_pm_asignado_id_fkey` FOREIGN KEY (`pm_asignado_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fase` ADD CONSTRAINT `Fase_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialFase` ADD CONSTRAINT `MaterialFase_fase_id_fkey` FOREIGN KEY (`fase_id`) REFERENCES `Fase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialFase` ADD CONSTRAINT `MaterialFase_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `CatalogoMaterial`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaseParte3D` ADD CONSTRAINT `FaseParte3D_faseId_fkey` FOREIGN KEY (`faseId`) REFERENCES `Fase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaseParte3D` ADD CONSTRAINT `FaseParte3D_parteId_fkey` FOREIGN KEY (`parteId`) REFERENCES `Parte3D`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parte3D` ADD CONSTRAINT `Parte3D_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
