-- Add catalogoMaterialId and make loteId optional for MaterialAsignadoTarea
ALTER TABLE `MaterialAsignadoTarea` ADD COLUMN `catalogo_material_id` VARCHAR(191) NULL;
ALTER TABLE `MaterialAsignadoTarea` MODIFY COLUMN `lote_id` VARCHAR(191) NULL;
ALTER TABLE `MaterialAsignadoTarea` ADD CONSTRAINT `MaterialAsignadoTarea_catalogoMaterialId_fkey` FOREIGN KEY (`catalogo_material_id`) REFERENCES `CatalogoMaterial`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX `MaterialAsignadoTarea_catalogoMaterialId_idx` ON `MaterialAsignadoTarea`(`catalogo_material_id`);
