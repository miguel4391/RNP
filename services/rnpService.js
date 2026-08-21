const axios = require("axios");
const tokenService = require("./tokenService");

async function enviarParaSPMS(bundle) {

    try {

        const token = await tokenService.obterAccessToken();

        console.log("========================================");
        console.log("ENVIO PARA SPMS");
        console.log("URL:", process.env.RNP_BUNDLE_URL);
        console.log("Token obtido:", !!token);
        console.log("========================================");

        const response = await axios.post(
            process.env.RNP_BUNDLE_URL,
            bundle,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/fhir+json",
                    Accept: "application/fhir+json"
                }
            }
        );

        console.log("Resposta SPMS:", response.status);
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.error("========================================");
        console.error("ERRO NO ENVIO PARA SPMS");
        console.error("========================================");

        if (error.response) {

            console.error("HTTP Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);

            console.error("Headers:");
            console.error(error.response.headers);

            console.error("Body devolvido pelo SPMS:");
            console.error(
                JSON.stringify(error.response.data, null, 2)
            );

        } else if (error.request) {

            console.error("Pedido enviado mas sem resposta:");
            console.error(error.request);

        } else {

            console.error("Erro:", error.message);
        }

        console.error("========================================");

        throw error;
    }
}

module.exports = {
    enviarParaSPMS
};