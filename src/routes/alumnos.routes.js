import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

//Ver alumnos registrados:
router.get("/verAlumnos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const alumnos = await prisma.alumnos.findMany({
          include: {
            matriculas: {
              select: {
                cursos: {
                  select: {
                    nombre: true,
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
            },
          },
        });
        res.json({
          message: "Alumnos registrados: ",
          alumnos: alumnos,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "error",
    });
  }
});

//Buscar alumnos según su número de dni
router.get("/buscarAlumnos/:dni", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const busqueda = await prisma.alumnos.findFirst({
          where: {
            dni: req.params.dni,
          },
          select: {
            nombre: true,
            apaterno: true,
            amaterno: true,
            matriculas: {
              select: {
                cursos: {
                  select: {
                    nombre: true,
                    descripcion: true,
                  },
                },
              },
            },
          },
        });

        if (!busqueda) {
          res.json({
            message: "El alumno no existe",
          });
          return;
        }

        res.json({
          message: "Alumno encontrado",
          busqueda: busqueda,
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

// Registrar nuevos alumnos
router.post("/registrarAlumnos", async (req, res) => {
  try {
    const { nombre, apaterno, amaterno, correo, numero, dni, password } =
      req.body;

    const alumno = await prisma.alumnos.findUnique({
      where: {
        dni: dni,
      },
    });

    if (alumno) {
      res.json({
        message: "El alumno ya existe",
      });
      return;
    }

    await prisma.alumnos.create({
      data: {
        nombre: nombre,
        apaterno: apaterno,
        amaterno: amaterno,
        correo: correo,
        dni: dni,
        password: password,
        numero: numero,
      },
    });
    console.log("Alumno registrado");
    res.json({
      message: "Alumno registrado con éxito",
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Error",
    });
  }
});

//Actualizar datos de los alumnos
router.put("/actualizarAlumnos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const {
          id,
          nombre,
          apaterno,
          amaterno,
          correo,
          numero,
          dni,
          password,
        } = req.body;

        const alumno = await prisma.alumnos.findUnique({
          where: { id: Number(id) },
        });

        if (!alumno) {
          res.json({
            message: "El alumno no existe",
          });
          return;
        }

        await prisma.alumnos.update({
          where: { id: Number(id) },
          data: {
            nombre: nombre,
            apaterno: apaterno,
            amaterno: amaterno,
            correo: correo,
            dni: dni,
            password: password,
            numero: numero,
          },
        });

        res.json({
          message: "Información del Alumno actualizada correctamente.",
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Error",
    });
  }
});

//Borrar alumnos:
router.delete("/borrarAlumnos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        // Verifica la existencia del alumno
        const existeAlumno = await prisma.alumnos.count({
          where: {
            id: Number(id),
          },
        });

        if (!existeAlumno) {
          res.json({
            message: "El alumno no existe",
          });
          return;
        }

        const resultado = await prisma.alumnos.delete({
          where: {
            id: Number(id),
          },
        });

        res.json({
          message: "El alumno ha sido borrado",
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Error",
    });
  }
});

//Iniciar sesion
router.put("/loginAlumnos", async (req, res) => {
  try {
    const { correo = null, password = null } = req.body;
    const respuesta = await prisma.alumnos.findUnique({
      where: {
        correo,
        password,
      },
    });
    if (respuesta == null) {
      res.json({
        message: "Datos incorrectos",
      });
    } else {
      const token = jwt.sign(respuesta, process.env.JWT_KEY, {
        expiresIn: 3600,
      });
      res.json({
        message: "Loggeo exitoso",
        token,
      });
    }
  } catch (e) {
    console.log(e);
    res.json({
      message: "error",
    });
  }
});

//Restablecer contraseña del alumno
router.put("/alumnoRestablecer", async (req, res) => {
  try {
    const { correo, dni } = req.body;
    const res1 = await prisma.alumnos.count({
      where: {
        correo: correo,
        dni: dni,
      },
    });
    //  Validar si el usuario existe
    if (res1 == 1) {
      //  Reestablecer contraseña
      await prisma.alumnos.update({
        where: {
          dni: dni,
        },
        data: {
          password: dni,
        },
      });
      res.json({
        message: "Contraseña actualizada con exito",
      });
    } else {
      res.json({
        message: "Datos no encontrados",
      });
    }
  } catch {
    res.json({
      message: "error",
    });
  }
});

export default router;
