const profissionalModel = require("../models/profissionalModel");
const {
    buildBundle
} = require("../services/profissionalMapper");
const {
    enviarParaSPMS
} = require("../services/rnpService");
const logger = require("../utils/logger");

async function enviarProfissional(req, res) {

    const inicio = Date.now();

    try {

        const idProfissional = Number(req.params.id);

        if (!idProfissional) {
            return res.status(400).json({
                sucesso: false,
                erro: "O campo 'id' do profissional é obrigatório."
            });
        }

        // -------------------------------------------------
        // 1. Obter dados do profissional
        // -------------------------------------------------

        const profissional =
            await profissionalModel.getProfissional(idProfissional);
        console.log("Dados do profissional obtidos:", profissional);
        if (!profissional) {

            return res.status(404).json({
                sucesso: false,
                erro: "Profissional não encontrado."
            });
        }

        // -------------------------------------------------
        // 2. Construir Bundle FHIR
        // -------------------------------------------------

        const bundle = buildBundle(profissional);

        // Descomentar para ver o bundle FHIR construído no console para debug
        console.log("Bundle FHIR construído:", JSON.stringify(bundle, null, 2));
        
        // -------------------------------------------------
        // 3. Enviar para o RNP / SPMS
        // -------------------------------------------------

        const resultado =
                await enviarParaSPMS(bundle);
        console.log("Resultado do envio para o RNP / SPMS:", resultado);
        // -------------------------------------------------
        // 4. Logging
        // -------------------------------------------------

        const tempo = Date.now() - inicio;

        logger.info({
            resultado: resultado,
            requestId: req.requestId,
            profissionalId: idProfissional,
            tempo: tempo
        });

        // -------------------------------------------------
        // 5. Resposta
        // -------------------------------------------------

        return res.status(200).json({
            sucesso: true,
            resultado: resultado
        });

    } catch (error) {

        const tempo = Date.now() - inicio;

        logger.error({
            resultado: error.message,
            requestId: req.requestId,
            profissionalId: req.body?.id,
            tempo: tempo
        });

        console.error("Erro no envio do profissional:", error);

        return res.status(500).json({
            sucesso: false,
            erro: error.message
        });
    }
}

module.exports = {
    enviarProfissional
};