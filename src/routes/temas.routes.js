import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.get("/verTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const tema1 = await prisma.cursos.findFirst({
          where: {
            idDocente: Number(payload.id),
          },
          select: {
            nombre: true,
            descripcion: false,
            temas: {
              select: {
                nombre: true,
                descripcion: true,
              },
            },
          },
        });
        if (!tema1) {
          res.json({
            message: "El tema no existe",
          });
        }
        res.json({
          message: "Temas registrados: ",
          temas: tema1,
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

router.post("/agregarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idCurso, nombre, descripcion } = req.body;
        const docente = payload.id;
        const curso = await prisma.cursos.findUnique({
          where: {
            id: Number(idCurso),
            idDocente: Number(docente),
          },
        });

        if (!curso) {
          res.json({
            message: "El usuario no es docente del curso",
          });
          return;
        }

        await prisma.temas.create({
          data: {
            idCurso: Number(idCurso),
            nombre: nombre,
            descripcion: descripcion,
          },
        });

        res.json({
          message: "Tema agregado con exito",
        });
      }
    });
  } catch {}
});

router.put("/actualizarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id, nombre, descripcion } = req.body;
        await prisma.temas.update({
          where: {
            id: Number(id),
          },
          data: {
            nombre: nombre,
            descripcion: descripcion,
          },
        });
        res.json({
          message: "Tema actualizado con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

router.delete("/borrarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        const existeTema = await prisma.temas.findFirst({
          where: {
            id: Number(id),
          },
        });

        if (!existeTema) {
          res.json({
            message: "El tema no existe",
          });
          return;
        }

        await prisma.temas.delete({
          where: {
            id: Number(id),
          },
        });

        res.json({
          message: "El tema se borro con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

router.get("/buscarTema", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const tema1 = await prisma.cursos.findUnique({
          where: {
            id: Number(id),
            idDocente: Number(payload.id),
          },
          select: {
            nombre: false,
            descripcion: false,
            temas: {
              select: {
                nombre: true,
                descripcion: true,
              },
            },
          },
        });
        if (!tema1) {
          res.json({
            message: "El tema no existe",
          });
        }
        res.json({
          message: "Temas registrados: ",
          temas: tema1,
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

export default router;
