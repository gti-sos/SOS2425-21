import express from "express";
import cors from "cors";
import { loadBackendAGB } from "./src/back/public-transit.js";
import { loadBackendPRG } from "./src/back/cultural-event.js";
import { loadBackendLEL } from "./src/back/home-buying-selling-stats.js";
import { handler } from './src/front/build/handler.js';


const app = express();
const PORT = process.env.PORT || 16078;

const BASE_API = "/api/v1";

app.use(express.json());
app.use(cors());
//app.use("/", express.static(__dirname));
  

loadBackendAGB(app);
loadBackendPRG(app); // 👈 NUEVA LÍNEA
loadBackendLEL(app);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(handler);
