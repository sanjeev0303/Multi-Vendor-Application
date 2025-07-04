import express from 'express';
import cors from "cors"
import morgan from "morgan"
import rateLimit from 'express-rate-limit';
import cookieParser from "cookie-parser"
import router from './routes/auth.router';
import { errorMiddleware } from '@packages/error-handler/errro-middleware';
import swaggerUi from "swagger-ui-express"
import swaggerDocument from './swagger-output.json';



const app = express();

app.use(cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ['Authorization', "Content-Type"],
    credentials: true,
}))

app.use(morgan("dev"));
app.use(express.json({limit: "100mb"}));
app.use(express.urlencoded({limit: "100mb", extended: true}));
app.use(cookieParser());

// Apply rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req: any) => (req.user ? 1000 : 100),
    message: {error: "Too many requests, please try again later!"},
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: (req: any) => req.ip,
})
app.use(limiter)

// app.get('/', (req, res) => {
//     res.send({ 'message': 'Hello From Auth Service'});
// });

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument)
})

// Routes
app.use("/api", router);

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
    console.log(`Auth service is running at http://localhost:${port}/api`);
    console.log(`Swagger Docs availabel at http://localhost:${port}/docs`);
})

server.on("error", (err) => {
    console.log("Server error", err);
})
