// utils/logger.js

const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");


// Criar diretoria se não existir
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}


// =====================================================
// Nome do ficheiro diário
// =====================================================

function getLogFileName() {

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoje.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}.log`;
}


// =====================================================
// Timestamp
// =====================================================

function timestamp() {

    return new Date().toISOString();
}


// =====================================================
// Escrita simples
// =====================================================

function write(texto) {

    const ficheiro = path.join(
        LOG_DIR,
        getLogFileName()
    );

    fs.appendFileSync(
        ficheiro,
        texto + "\n",
        "utf8"
    );
}


// =====================================================
// Log RNP
// =====================================================

function logRNP({
    requestId,
    profissionalId,
    tempoMs,
    resultado,
    erro
}) {

    const linha = {

        dataHora: timestamp(),

        requestId,

        profissionalId,

        tempoMs,

        sucesso: !erro,

        resultado,

        erro
    };

    write(
        JSON.stringify(linha)
    );
}


// =====================================================
// Log genérico
// =====================================================

function info(msg) {

    write(
        `[${timestamp()}] INFO - ${msg}`
    );
}


function error(msg) {

    write(
        `[${timestamp()}] ERROR - ${msg}`
    );
}


// =====================================================
// Export
// =====================================================

module.exports = {

    write,

    info,

    error,

    logRNP
};