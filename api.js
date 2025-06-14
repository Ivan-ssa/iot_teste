const express = require("express");
const cors = require("cors");
const app = express();

// --- Configurações da API ---
const PORT = process.env.PORT || 3000; // Define a porta, preferindo a variável de ambiente (para Render.com)
const API_PREFIX = "/api"; // Prefixo para todas as rotas da API (opcional, mas boa prática para escalabilidade)

// --- Middlewares ---
// Permite requisições de diferentes origens (importante para o frontend)
app.use(cors());
// Parseia o corpo das requisições JSON
app.use(express.json());

// --- Variáveis de Estado ---
// Variável para armazenar o UID da última tag lida.
// Inicializa com uma mensagem padrão ou null se preferir que o frontend trate.
let latestTagUID = null; // Alterado para null, para que o frontend possa exibir "Nenhuma tag lida ainda."

// --- Rotas da API ---

/**
 * @route POST /api/tag
 * @desc Recebe o UID da tag do ESP32 e armazena.
 * @body {string} tagId - O ID da tag RFID.
 */
app.post(`${API_PREFIX}/tag`, (req, res) => {
  const { tagId } = req.body; // Espera que o corpo da requisição contenha { "tagId": "..." }

  // Validação básica de entrada
  if (!tagId || typeof tagId !== "string" || tagId.trim() === "") {
    console.warn("Requisição POST /tag inválida: tagId ausente ou inválido.", req.body);
    return res.status(400).json({
      status: "erro",
      mensagem: "tagId ausente ou em formato inválido no corpo da requisição.",
    });
  }

  // Atualiza a variável com o novo UID da tag
  latestTagUID = tagId.trim(); // Remove espaços em branco
  console.log(`[API] Tag recebida: ${latestTagUID} de ${req.ip}`); // Log detalhado, incluindo IP
  
  // Envia uma resposta de sucesso ao ESP32
  res.status(200).json({
    status: "sucesso",
    mensagem: "Tag recebida e armazenada com sucesso.",
    tagId: latestTagUID,
  });
});

/**
 * @route GET /api/latest-tag
 * @desc Retorna o UID da última tag lida para o frontend.
 */
app.get(`${API_PREFIX}/latest-tag`, (req, res) => {
  // Retorna o UID da última tag lida. Se for null, o frontend interpretará.
  res.status(200).json({ tagId: latestTagUID });
});

// --- Rota de Verificação de Saúde (Health Check) ---
// Útil para plataformas como Render.com para verificar se o serviço está rodando
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API está online e funcionando.",
    latestTag: latestTagUID,
    timestamp: new Date().toISOString(),
  });
});

// --- Tratamento de Rotas Não Encontradas (404) ---
app.use((req, res, next) => {
  res.status(404).json({
    status: "erro",
    mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// --- Tratamento de Erros Gerais (Middleware de Erro) ---
app.use((err, req, res, next) => {
  console.error("[API ERROR]", err.stack); // Loga o stack trace do erro no console do servidor
  res.status(500).json({
    status: "erro",
    mensagem: "Erro interno do servidor. Por favor, tente novamente mais tarde.",
    detalhes: process.env.NODE_ENV === 'production' ? undefined : err.message // Não expõe detalhes em produção
  });
});


// --- Início do Servidor ---
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
  console.log(`Acesse a rota de saúde: http://localhost:${PORT}${API_PREFIX}/health`);
});
