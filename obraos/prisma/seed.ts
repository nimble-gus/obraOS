import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@obraos.com";
  const existing = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Admin ya existe:", adminEmail);
  } else {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await prisma.usuario.create({
      data: {
        nombre: "Administrador",
        email: adminEmail,
        passwordHash,
        rol: "ADMIN",
        estado: "ACTIVO",
      },
    });
    console.log("Usuario admin creado:", adminEmail, "| contraseña: admin123");
  }

  // PM de ejemplo
  const pmEmail = "pm@obraos.com";
  let pm = await prisma.usuario.findUnique({ where: { email: pmEmail } });
  if (!pm) {
    const pw = await bcrypt.hash("pm123", 10);
    pm = await prisma.usuario.create({
      data: {
        nombre: "Carlos Ramírez",
        email: pmEmail,
        passwordHash: pw,
        rol: "PROJECT_MANAGER",
        estado: "ACTIVO",
      },
    });
    console.log("PM creado:", pmEmail, "| contraseña: pm123");
  }

  // Tipos de servicio base
  const tiposBase = [
    "Renta grúa",
    "Fletes",
    "Renta maquinaria",
    "Transporte",
    "Servicios generales",
  ];
  for (let i = 0; i < tiposBase.length; i++) {
    const nombre = tiposBase[i];
    const existe = await prisma.catalogoTipoServicio.findFirst({ where: { nombre } });
    if (!existe) {
      await prisma.catalogoTipoServicio.create({
        data: { nombre, orden: i, activo: true },
      });
      console.log("Tipo de servicio creado:", nombre);
    }
  }

  // ModeloCasa por defecto
  let modeloDefault = await prisma.modeloCasa.findFirst({ where: { nombre: "Modelo estándar" } });
  if (!modeloDefault) {
    modeloDefault = await prisma.modeloCasa.create({
      data: {
        nombre: "Modelo estándar",
        anchoExterior: 10,
        profundidadExterior: 8,
        alturaParedes: 5,
        grosorMuro: 0.3,
        tipoTecho: "PIRAMIDAL",
        numVentanasFront: 2,
        numVentanasSide: 1,
        tienePuerta: true,
      },
    });
    console.log("ModeloCasa por defecto creado");
  }

  // Proyecto de ejemplo con fases y partes3D
  const proyectoExistente = await prisma.proyecto.findFirst();
  if (!proyectoExistente && pm) {
    const proy = await prisma.proyecto.create({
      data: {
        nombre: "Residencial El Roble",
        tipo: "RESIDENCIAL",
        ubicacion: "Zona 16, Guatemala",
        numUnidades: 4,
        pmAsignadoId: pm.id,
        precioVenta: 3200000,
        margenObjetivo: 0.18,
        pctCostosIndirectos: 0.12,
        pctContingencia: 0.05,
        status: "ACTIVO",
      },
    });
    await prisma.fase.createMany({
      data: [
        { proyectoId: proy.id, nombre: "Cimentación", orden: 0, status: "DONE", pctAvance: 100, partes3D: ["foundation"] },
        { proyectoId: proy.id, nombre: "Estructura", orden: 1, status: "ACTIVE", pctAvance: 75, partes3D: ["foundation", "columns", "slab", "walls"] },
        { proyectoId: proy.id, nombre: "Mampostería", orden: 2, status: "PENDING", pctAvance: 0, partes3D: ["foundation", "columns", "slab", "walls", "door", "windows"] },
        { proyectoId: proy.id, nombre: "Instalaciones", orden: 3, status: "PENDING", pctAvance: 0, partes3D: ["foundation", "columns", "slab", "walls", "pipes", "door", "windows"] },
        { proyectoId: proy.id, nombre: "Acabados", orden: 4, status: "PENDING", pctAvance: 0, partes3D: ["foundation", "columns", "slab", "walls", "pipes", "facade", "door", "windows", "roof", "details"] },
      ],
    });
    console.log("Proyecto de ejemplo creado: Residencial El Roble");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
