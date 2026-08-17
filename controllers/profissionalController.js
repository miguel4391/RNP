const { randomUUID } = require("crypto");
const fs = require('fs');
const path = require('path');
const profissionalService = require("../services/profissionalService");

async function enviar(req, res, next) {
    const requestId = randomUUID();

    try {
        const idProfissional = Number(req.params.id);

        if (!Number.isInteger(idProfissional) || idProfissional <= 0) {
            return res.status(400).json({
                sucesso: false,
                estado: "ERRO_PEDIDO",
                requestId,
                mensagem: "ID de profissional inválido."
            });
        }

        const resultado = await profissionalService.processar(
            idProfissional,
            requestId
        );

        if (resultado.estado === "ERRO_VALIDACAO") {
            escreverLog(requestId, idProfissional, resultado, "ERRO");
            return res.status(422).json(resultado);
        }

        if (resultado.estado === "ERRO_SPMS") {
            escreverLog(requestId, idProfissional, resultado, "ERRO");
            return res.status(502).json(resultado);
        }
        escreverLog(requestId, idProfissional, resultado, "ok");
        return res.status(200).json(resultado);

    } catch (erro) {
        console.error("Erro ao processar a requisição:", erro);
        erro.requestId = requestId;
        next(erro);
    }
}

function escreverLog(requestId, profissional, resultado, tipo) {

    const logDir = path.join(__dirname, '..', 'logs');

    // Garante que a diretoria existe
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const agora = new Date();

    // Data/hora para o conteúdo do log
    const dataHora = agora.toLocaleString('pt-PT');

    // Nome do ficheiro: YYYY-MM-DD.txt
    const nomeFicheiro = agora.toISOString().slice(0, 10) + `_${tipo}.txt`;

    const logFile = path.join(logDir, nomeFicheiro);

    const resultadoLog =
        typeof resultado === 'object'
            ? JSON.stringify(resultado)
            : resultado;

    const linha =
        `[${dataHora}] ` +
        //`[requestId: ${requestId}] ` +
        `[profissional: ${profissional}] ` +
        `Resultado: ${resultadoLog}\n`;

    fs.appendFileSync(logFile, linha, 'utf8');
}

module.exports = {
    enviar
};
