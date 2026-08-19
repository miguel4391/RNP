const axios = require("axios");

let accessToken = null;
let refreshToken = null;
let expiresAt = 0;

/**
 * Guarda os tokens recebidos pelo servidor SPMS
 */
function guardarTokens(data) {
    if (!data || !data.access_token) {
        throw new Error("Resposta de token inválida: access_token não recebido");
    }

    accessToken = data.access_token;

    // O refresh_token pode ser renovado a cada pedido
    if (data.refresh_token) {
        refreshToken = data.refresh_token;
    }

    // expires_in vem em segundos
    // Retiramos 30 segundos para evitar usar o token mesmo no limite da validade
    const expiresIn = Number(data.expires_in || 0);

    expiresAt = Date.now() + ((expiresIn - 30) * 1000);

    console.log(
        `[TOKEN] Novo access token obtido. Expira em ${expiresIn} segundos.`
    );
}


/**
 * Obtém o primeiro token utilizando username/password
 *
 * Segundo o manual:
 * POST /oauth/token
 * Content-Type: application/x-www-form-urlencoded
 * grant_type=password
 */
async function obterTokenInicial() {

    const params = new URLSearchParams();

    params.append("grant_type", "password");
    params.append("username", process.env.RNP_USERNAME);
    params.append("password", process.env.RNP_PASSWORD);
    params.append("client_id", process.env.RNP_CLIENT_ID);
    params.append("client_secret", process.env.RNP_CLIENT_SECRET);

    // O scope é indicado no manual como parâmetro.
    // Só o enviamos se estiver configurado.
    if (process.env.RNP_SCOPE) {
        params.append("scope", process.env.RNP_SCOPE);
    }

    console.log("[TOKEN] A obter primeiro token...");

    try {

        const response = await axios.post(
            process.env.RNP_TOKEN_URL,
            params.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout: 30000
            }
        );

        guardarTokens(response.data);

        return accessToken;

    } catch (error) {

        const status = error.response?.status;
        const data = error.response?.data;

        console.error(
            "[TOKEN] Erro na obtenção do token:",
            status || "",
            data || error.message
        );

        throw new Error("Não foi possível obter o token SPMS");
    }
}


/**
 * Obtém um novo access token utilizando o refresh_token
 */
async function renovarToken() {

    if (!refreshToken) {
        console.log("[TOKEN] Não existe refresh_token disponível.");
        return obterTokenInicial();
    }

    const params = new URLSearchParams();

    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);
    params.append("client_id", process.env.RNP_CLIENT_ID);
    params.append("client_secret", process.env.RNP_CLIENT_SECRET);

    console.log("[TOKEN] A renovar access token através do refresh_token...");

    try {

        const response = await axios.post(
            process.env.RNP_TOKEN_URL,
            params.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout: 30000
            }
        );

        guardarTokens(response.data);

        return accessToken;

    } catch (error) {

        const status = error.response?.status;
        const data = error.response?.data;

        console.error(
            "[TOKEN] Erro na renovação do token:",
            status || "",
            data || error.message
        );

        /*
         * IMPORTANTE:
         * O manual indica que o refresh_token pode expirar.
         *
         * Nesse caso não devemos simplesmente tentar
         * reutilizá-lo indefinidamente.
         *
         * Se a SPMS rejeitar o refresh_token, limpamos os tokens.
         */
        accessToken = null;
        refreshToken = null;
        expiresAt = 0;

        throw new Error(
            "Não foi possível renovar o token SPMS. " +
            "O refresh_token pode ter expirado."
        );
    }
}


/**
 * Devolve um access token válido.
 *
 * Esta é a função que o resto da aplicação deverá utilizar.
 */
async function obterAccessToken() {

    // Ainda temos um access token válido
    if (
        accessToken &&
        expiresAt &&
        Date.now() < expiresAt
    ) {
        return accessToken;
    }

    // Temos refresh token -> tentar renovar
    if (refreshToken) {
        return renovarToken();
    }

    // Não temos nenhum token -> primeira autenticação
    return obterTokenInicial();
}


/**
 * Permite consultar o estado do serviço
 * sem devolver os próprios tokens.
 */
function estado() {

    return {
        temAccessToken: !!accessToken,
        temRefreshToken: !!refreshToken,
        expiraEm: expiresAt
            ? new Date(expiresAt).toISOString()
            : null
    };
}


module.exports = {
    obterAccessToken,
    obterTokenInicial,
    renovarToken,
    estado
};