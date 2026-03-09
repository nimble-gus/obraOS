-- CreateTable
CREATE TABLE `PresupuestoRubro` (
    `id` VARCHAR(191) NOT NULL,
    `proyecto_id` VARCHAR(191) NOT NULL,
    `rubro` VARCHAR(191) NOT NULL,
    `pct_presupuesto` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `PresupuestoRubro_proyecto_id_idx`(`proyecto_id`),
    UNIQUE INDEX `PresupuestoRubro_proyecto_id_rubro_key`(`proyecto_id`, `rubro`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PresupuestoRubro` ADD CONSTRAINT `PresupuestoRubro_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
