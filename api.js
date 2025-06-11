const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let contador = 0;

// Rota para receber incremento do ESP32
app.post("/incrementar", (req, res) => {
  contador++;
  res.json({ contador });
});

// Rota para consultar o contador atual
app.get("/contador", (req, res) => {
  res.json({ contador });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
