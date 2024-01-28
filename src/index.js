import express from "express";
import cors from "cors";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import cursosRoutes from "./routes/cursos.routes.js";
import temasRoutes from "./routes/temas.routes.js";
import matriculasRoutes from "./routes/matriculas.routes.js";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/app", alumnosRoutes);
app.use("/app", docentesRoutes);
app.use("/app", cursosRoutes);
app.use("/app", temasRoutes);
app.use("/app", matriculasRoutes);

app.listen(3000);
console.log("Server on port", 3000);
