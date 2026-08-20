const profissionalModel = require("../models/profissionalModel");
const { validarProfissional } = require("../validation/profissionalValidation");
const rnpService = require("./rnpService");

async function processar(idProfissional, requestId) {

    const profissional =
        await profissionalModel.getProfissional(idProfissional);

    if (!profissional) {
        return {
            sucesso: false,
            estado: "ERRO_NAO_ENCONTRADO",
            requestId,
            mensagem: "Profissional não encontrado."
        };
    }

    console.log(
        "PROFISSIONAL A VALIDAR:",
        JSON.stringify(profissional, null, 2)
    );

    const validacao = validarProfissional(profissional);

    if (!validacao.success) {
        return {
            sucesso: false,
            estado: "ERRO_VALIDACAO",
            requestId,
            erros: validacao.errors
        };
    }

    const resultado =
        await rnpService.enviarProfissional(profissional, requestId);

    return {
        ...resultado,
        requestId
    };
}

module.exports = {
    processar
};
