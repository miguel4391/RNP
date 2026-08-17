module.exports = function apiKey(req, res, next) {

    const configuredKey = process.env.API_KEY;

    // Em produção, a chave deve estar configurada.
    if (!configuredKey) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "API_KEY não configurada."
        });
    }

    const receivedKey = req.get("X-API-Key");

    if (!receivedKey || receivedKey !== configuredKey) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Não autorizado."
        });
    }

    next();
};
