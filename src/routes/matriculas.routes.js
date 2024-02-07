import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.get("/verMatriculas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      console.log(payload);
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const matriculas = await prisma.matriculas.findMany({
          select: {
            cursos: {
              select: {
                nombre: true,
                descripcion: true,
                docente: {
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
          message: "Matriculas realizadas: ",
          matriculas: matriculas,
        });
      }
    });
  } catch {
    res.json({
      message: "Error ",
    });
  }
});

router.get("/buscarMatricula", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        const result = await prisma.matriculas.findFirst({
          where: {
            id: Number(id),
          },
          select: {
            id: false,
            idAlumno: false,
            idCurso: false,
            estado: true,
            alumnos: {
              select: {
                nombre: true,
                amaterno: true,
                apaterno: true,
              },
            },
            cursos: {
              select: {
                nombre: true,
              },
            },
          },
        });
        res.json({
          message: "Matriculas realizadas: ",
          result: result,
        });
      }
    });
  } catch {
    res.json({
      message: "error",
    });
  }
});

router.post("/matricularAlumno", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      console.log(payload);
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idCurso } = req.body;
        // Verifica si el curso existe
        const curso = await prisma.cursos.findUnique({
          where: { id: Number(idCurso) },
        });
        if (!curso) {
          return res.json({
            message: "El curso no existe",
          });
        }
        // Verifica si el alumno ya está matriculado en el curso
        const matriculas = await prisma.matriculas.findMany({
          where: {
            idAlumno: Number(payload.id),
            idCurso: Number(idCurso),
          },
        });

        if (matriculas.length > 0) {
          return res.json({
            message: "El alumno ya está matriculado en este curso",
          });
        }

        // Matricula al alumno
        await prisma.matriculas.create({
          data: {
            idCurso: Number(idCurso),
            idAlumno: Number(payload.id),
          },
        });
        res.json({
          message: "Alumno matriculado con éxito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

router.delete("/borrarMatricula", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        await prisma.matriculas.delete({
          where: { id: Number(id) },
        });
        res.json({
          message: "La matricula ha sido borrada con exito",
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
