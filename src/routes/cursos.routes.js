import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.get("/verCursos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Hubo un error en el token",
        });
      } else {
        const idDocente = Number(payload.id);

        const busdoc = await prisma.docente.findUnique({
          where: {
            id: Number(payload.id),
          },
        });

        if (!busdoc) {
          res.json({
            message: "El docente no existe o no ha iniciado sesion",
          });
        }

        // Obtiene los cursos del docente
        const cursos = await prisma.cursos.findMany({
          where: {
            idDocente: idDocente,
          },
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            gys: true,
            matriculas: {
              select: {
                alumnos: {
                  select: {
                    nombre: true,
                    apaterno: true,
                    amaterno: true,
                  },
                },
              },
            },
          },
        });
        res.json({
          message: "cursos registrados",
          cursos: cursos,
        });
      }
    });
  } catch {
    res.json({
      message: "Error en el sistema",
    });
  }
});

router.post("/crearCurso", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const resultado = await prisma.docente.findUnique({
          where: {
            id: Number(payload.id),
          },
        });
        if (!resultado) {
          res.json({
            message: "El docente no existe o borro la cuenta",
          });
        } else {
          const { nombre, descripcion, nivel, gys } = req.body;
          await prisma.cursos.create({
            data: {
              nombre: nombre,
              descripcion: descripcion,
              nivel: Number(nivel),
              gys: gys,
              idDocente: Number(payload.id),
            },
          });
          res.json({
            message: "El curso se creo con exito",
          });
        }
      }
    });
  } catch {
    res.json({
      message: "error",
    });
  }
});

router.put("/actualizarCurso", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id, nombre, descripcion, nivel } = req.body;

        const curso = await prisma.cursos.findUnique({
          where: {
            id: Number(id),
            idDocente: Number(payload.id),
          },
        });

        if (!curso) {
          res.json({
            message:
              "El usuario no es docente del curso y/o el curso no existe",
          });
          return;
        }

        await prisma.cursos.update({
          where: { id: Number(id) },
          data: {
            nombre: nombre,
            descripcion: descripcion,
            nivel: Number(nivel),
          },
        });

        res.json({
          message: "Curso actualizado con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

router.delete("/eliminarCurso", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        // Verifica si el curso existe
        const curso = await prisma.cursos.findUnique({
          where: {
            id: Number(id),
            idDocente: Number(payload.id),
          },
        });

        if (!curso) {
          return res.json({
            message: "El curso no existe o no es docente del curso",
          });
        }

        // Elimina el curso
        await prisma.cursos.delete({
          where: {
            id: Number(id),
          },
        });
        res.json({
          message: "El curso ha sido borrado con éxito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

router.get("/buscarCurso", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const result = await prisma.cursos.findFirst({
          where: {
            id: id,
          },
          select: {
            id: false,
            nombre: true,
            descripcion: true,
            docente: {
              select: {
                id: false,
                nombre: true,
                apaterno: true,
                amaterno: true,
              },
            },
          },
        });
        if (!result) {
          res.json({
            message: "El curso no existe",
          });
        }
        res.json({
          message: "Cursos encontrados:",
          result: result,
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
