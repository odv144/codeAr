import "dotenv/config";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { connectDB } from "../config/db.js";
import Organizacion from "../models/Organizaciones.js";
import Donante from "../models/Donantes.js";
import Proyecto from "../models/Proyectos.js";
import Donacion from "../models/Donaciones.js";
import Gasto from "../models/Gastos.js";
import { totalDonado } from "../services/serviceDonaciones.js";
import {
    totalGastado,
    ingresosProyecto,
    saldoIndividualProyecto
} from "../services/saldoService.js";
import { saldoProyectosActivos } from "../services/serviceProyecto.js";

// ---------------------------------------------------------------------------
// Verificación del cálculo de saldo INDIVIDUAL por proyecto.
// Fórmula: Saldo = (Monto base + Total Donaciones del proyecto) - Total Gastos
// Todo filtrado estrictamente por ObjectId: dos proyectos nunca comparten saldo.
//
// Uso:  node scripts/verificarSaldos.js   (o npm run verificar-saldos)
// Borra y recrea sus propios datos de prueba ([TEST-SALDO]) en cada corrida.
// ---------------------------------------------------------------------------
const MARCA = "[TEST-SALDO]";
const escapaRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const POR_MARCA = new RegExp("^" + escapaRegex(MARCA));
const MAIL_DONANTE_TEST = "test-saldo-donante@correo.test";

async function limpiarDatosDePrueba() {
    const proyectos = await Proyecto.find({ nomProyecto: POR_MARCA })
        .select("_id")
        .lean();
    const ids = proyectos.map((p) => p._id);

    if (ids.length > 0) {
        await Donacion.deleteMany({ idProyecto: { $in: ids } });
        await Gasto.deleteMany({ idProyecto: { $in: ids } });
        await Proyecto.deleteMany({ _id: { $in: ids } });
    }
    await Organizacion.deleteMany({ nombre: POR_MARCA });
    await Donante.deleteMany({ email: MAIL_DONANTE_TEST });
}

// Reutiliza un donante existente (la coleccion puede tener un indice unico
// espurio sobre idDonante que choca con null); si no hay, crea uno propio.
async function donanteDePrueba() {
    const existente = await Donante.findOne().sort({ _id: 1 }).lean();
    if (existente) return existente._id;

    const { insertedId } = await Donante.collection.insertOne({
        nombre: "Test",
        apellido: "Saldos",
        dni: "99999999",
        telefono: "3415551234",
        email: MAIL_DONANTE_TEST,
        monto: 0,
        fecha: new Date(),
        idDonante: new mongoose.Types.ObjectId()
    });
    return insertedId;
}

async function sembrarDatosDePrueba() {
    const organizacion = await Organizacion.create({
        nombre: `${MARCA} Organizacion`,
        tipo: "Verificacion",
        cuil: "30-99999997-9",
        telefono: "341-5551234",
        mail: "test-saldo-org@correo.test",
        direccion: "Calle de Prueba 123",
        responsable: "Verificacion de Saldos"
    });

    const donanteId = await donanteDePrueba();

    const base = (monto) => [{ monto, fecha: new Date() }];

    // Proyecto A: base 100.000 + donaciones 70.000 - gastos 30.000 = 140.000
    const proyectoA = await Proyecto.create({
        idOrganizacion: organizacion._id,
        nomProyecto: `${MARCA} Proyecto A`,
        descripcion: "Prueba de aislamiento de saldo A",
        saldo: base(100000)
    });

    // Proyecto B: base 50.000 + donacion 20.000 - gastos 10.000 = 60.000
    const proyectoB = await Proyecto.create({
        idOrganizacion: organizacion._id,
        nomProyecto: `${MARCA} Proyecto B`,
        descripcion: "Prueba de aislamiento de saldo B",
        saldo: base(50000)
    });

    // Proyecto C: sin donaciones ni gastos => saldo 0 (no NaN ni null)
    const proyectoC = await Proyecto.create({
        idOrganizacion: organizacion._id,
        nomProyecto: `${MARCA} Proyecto C`,
        descripcion: "Proyecto sin movimientos",
        saldo: []
    });

    // Proyecto D: dado de baja, con movimientos (base 10.000 + donacion 5.000)
    const proyectoD = await Proyecto.create({
        idOrganizacion: organizacion._id,
        nomProyecto: `${MARCA} Proyecto D`,
        descripcion: "Proyecto dado de baja",
        saldo: base(10000),
        activa: false
    });

    const donaciones = [
        { idProyecto: proyectoA._id, monto: 50000 },
        { idProyecto: proyectoA._id, monto: 20000 },
        { idProyecto: proyectoB._id, monto: 20000 },
        { idProyecto: proyectoD._id, monto: 5000 }
    ];
    // Inserts nativos con idDonacion/idGasto explicitos: la coleccion puede
    // tener indices unicos espurios sobre esos campos (dup key con null).
    await Donacion.collection.insertMany(
        donaciones.map(({ idProyecto, monto }) => ({
            idDonacion: new mongoose.Types.ObjectId(),
            monto,
            cbu: "0123456789012345678901",
            fecha: new Date(),
            idProyecto,
            idDonante: donanteId,
            idOrganizacion: organizacion._id
        }))
    );

    await Gasto.collection.insertMany([
        {
            idGasto: new mongoose.Types.ObjectId(),
            idProyecto: proyectoA._id,
            descripcion: "Gasto del proyecto A",
            monto: 30000,
            fecha: new Date()
        },
        {
            idGasto: new mongoose.Types.ObjectId(),
            idProyecto: proyectoB._id,
            descripcion: "Gasto del proyecto B",
            monto: 10000,
            fecha: new Date()
        }
    ]);

    return { proyectoA, proyectoB, proyectoC, proyectoD };
}

async function verificarSaldos({ proyectoA, proyectoB, proyectoC, proyectoD }) {
    // 1) Ingresos y gastos por proyecto, filtrados por su ObjectId
    assert.equal(await totalDonado(proyectoA._id), 70000, "A: total donado");
    assert.equal(await totalGastado(proyectoA._id), 30000, "A: total gastado");
    assert.equal(await ingresosProyecto(proyectoA._id), 170000, "A: ingresos");

    assert.equal(await totalDonado(proyectoB._id), 20000, "B: total donado");
    assert.equal(await totalGastado(proyectoB._id), 10000, "B: total gastado");

    // 2) AISLAMIENTO: cada proyecto tiene su saldo propio (nunca el consolidado)
    assert.equal(
        await saldoIndividualProyecto(proyectoA._id),
        140000,
        "A: saldo individual (100000 + 70000 - 30000)"
    );
    assert.equal(
        await saldoIndividualProyecto(proyectoB._id),
        60000,
        "B: saldo individual (50000 + 20000 - 10000)"
    );
    // Anti-bug: A no debe devolver la suma global (A + B = 200.000)
    assert.notEqual(
        await saldoIndividualProyecto(proyectoA._id),
        200000,
        "A: no debe ser el saldo consolidado global"
    );

    // 3) Proyecto sin donaciones ni gastos => 0 (no NaN ni null)
    const saldoC = await saldoIndividualProyecto(proyectoC._id);
    assert.equal(saldoC, 0, "C: sin movimientos debe ser 0");
    assert.ok(Number.isFinite(saldoC), "C: debe ser un numero finito");

    // 4) IDs invalidos o inexistentes => 0 (nunca saldo global de todos)
    assert.equal(await saldoIndividualProyecto("no-es-un-id"), 0, "ID invalido");
    assert.equal(
        await saldoIndividualProyecto(new mongoose.Types.ObjectId()),
        0,
        "ID inexistente"
    );
    assert.equal(await saldoProyectosActivos("no-es-un-id"), 0, "wrapper: ID invalido");

    // 5) El wrapper estricto solo responde por proyectos activos...
    assert.equal(
        await saldoProyectosActivos(proyectoA._id),
        140000,
        "wrapper: proyecto activo"
    );
    assert.equal(await saldoProyectosActivos(proyectoD._id), 0, "wrapper: proyecto de baja = 0");
    // ...pero el detalle del proyecto de baja sigue mostrando su saldo propio
    assert.equal(
        await saldoIndividualProyecto(proyectoD._id),
        15000,
        "D (baja): saldo individual (10000 + 5000)"
    );
}

async function main() {
    await connectDB();
    let fallo = false;
    try {
        await limpiarDatosDePrueba();
        const datos = await sembrarDatosDePrueba();
        await verificarSaldos(datos);
        console.log("OK: saldos individuales verificados (A=140000, B=60000, C=0, D=15000).");
        console.log("OK: dos proyectos distintos mantienen saldos independientes.");
    } catch (error) {
        fallo = true;
        console.error("FALLO en la verificacion de saldos:");
        console.error(error);
    } finally {
        await limpiarDatosDePrueba();
        await mongoose.disconnect();
    }
    process.exit(fallo ? 1 : 0);
}

const esEjecucionDirecta =
    process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (esEjecucionDirecta) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
