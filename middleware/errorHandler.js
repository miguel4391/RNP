function errorHandler(err, req, res, next) {

    console.error({
        requestId: err.requestId,
        message: err.message,
        stack: process.env.NODE_ENV === "development"
            ? err.stack
            : undefined
    });

    res.status(500).json({
        sucesso: false,
        estado: "ERRO_INTERNO",
        requestId: err.requestId,
        mensagem: "Ocorreu um erro interno no processamento."
    });
}

module.exports = {
    errorHandler
};
