const axios = require("axios");
const tokenService = require("./tokenService");

async function enviarParaSPMS(bundle) {

    const token = await tokenService.obterAccessToken();

    const response = await axios.post(
        process.env.RNP_URL,
        bundle,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/fhir+json"
            }
        }
    );

    return response.data;
}

module.exports = {
    enviarParaSPMS
};