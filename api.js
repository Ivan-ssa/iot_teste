const express = require("express");
const cors = require("cors");
const app = express();

// Middleware para permitir requisições de diferentes origens (importante para o frontend)
app.use(cors());
// Middleware para parsear o corpo das requisições JSON
app.use(express.json());

// Variável para armazenar o UID da última tag lida.
// Inicializa com uma mensagem padrão.
let latestTagUID = "Nenhuma tag lida ainda.";

// Rota POST: Recebe o UID da tag do ESP32
// O ESP32 fará um POST para esta rota com o UID da tag no corpo da requisição JSON.
app.post("/tag", (req, res) => {
  const { tagId } = req.body; // Espera que o corpo da requisição contenha { "tagId": "..." }

  // Verifica se o 'tagId' foi fornecido na requisição
  if (tagId) {
    latestTagUID = tagId; // Atualiza a variável com o novo UID da tag
    console.log(`Tag recebida: ${latestTagUID}`); // Loga a tag recebida no console do servidor
    // Envia uma resposta de sucesso ao ESP32
    res.json({ status: "sucesso", tagId: latestTagUID });
  } else {
    // Se 'tagId' não for fornecido, envia um erro 400 (Bad Request)
    res.status(400).json({ status: "erro", mensagem: "tagId ausente no corpo da requisição." });
  }
});

// Rota GET: Retorna o UID da última tag lida para o frontend
// A página HTML fará um GET para esta rota para exibir a tag.
app.get("/latest-tag", (req, res) => {
  // Retorna o UID da última tag lida em formato JSON
  res.json({ tagId: latestTagUID });
});

// Define a porta em que a API vai rodar. Usa a porta do ambiente (para Render.com) ou 3000.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
