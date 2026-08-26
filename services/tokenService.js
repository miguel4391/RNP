const axios = require("axios");
const qs = require("qs");

const {
    lerToken,
    guardarToken
} = require("../models/rnpToken");

const rnpConfig = require("../config/rnp");


async function obterAccessToken() {

    const tokenGuardado = await lerToken();

    // ---------------------------------------------------------
    // 1. Temos token guardado?
    // ---------------------------------------------------------

    if (tokenGuardado) {

        const agora = Date.now();

        const obtidoEm = new Date(
            tokenGuardado.obtido_em
        ).getTime();

        const validadeMs =
            tokenGuardado.expires_in * 1000;

        const expiraEm =
            obtidoEm + validadeMs;

        // Margem de segurança de 60 segundos
        const margem = 60 * 1000;

        if (agora < (expiraEm - margem)) {

            console.log(
                "Token existente na BD ainda é válido."
            );

            return tokenGuardado.access_token;
        }
    }


    // ---------------------------------------------------------
    // 2. Token inexistente ou expirado
    //    Tentar refresh token
    // ---------------------------------------------------------

    if (
        tokenGuardado &&
        tokenGuardado.refresh_token
    ) {

        try {

            console.log(
                "Token expirado. A obter novo token através do refresh token..."
            );

            const response = await axios.post(
                rnpConfig.tokenUrl,
                qs.stringify({
                    grant_type: "refresh_token",
                    refresh_token: tokenGuardado.refresh_token,
                    client_id: process.env.RNP_CLIENT_ID,
                    client_secret: process.env.RNP_CLIENT_SECRET
                }),
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    }
                }
            );

            const novoToken = await guardarToken(
                response.data
            );

            console.log(
                "Novo token obtido através do refresh token."
            );

            return novoToken.access_token;

        } catch (error) {

            console.error(
                "Erro ao renovar token:",
                error.response?.data || error.message
            );

            // Se o refresh falhar, vamos tentar
            // obter um token inicial novamente.
        }
    }


    // ---------------------------------------------------------
    // 3. Primeiro token
    // ---------------------------------------------------------

    console.log(
        "A obter primeiro token através de username/password..."
    );

    const response = await axios.post(
        rnpConfig.tokenUrl,
        qs.stringify({
            grant_type: "password",
            username: process.env.RNP_USERNAME,
            password: process.env.RNP_PASSWORD,
            client_id: process.env.RNP_CLIENT_ID,
            client_secret: process.env.RNP_CLIENT_SECRET,
            scope: process.env.RNP_SCOPE
        }),
        {
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            }
        }
    );


    // ---------------------------------------------------------
    // 4. Guardar novo token na BD
    // ---------------------------------------------------------

    const novoToken = await guardarToken(
        response.data
    );

    console.log(
        "Primeiro token obtido e guardado na BD."
    );

    return novoToken.access_token;
}


module.exports = {
    obterAccessToken
};