const axios = require('axios');

let tokenData = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null
};

const TOKEN_URL = process.env.RNP_TOKEN_URL;
const CLIENT_ID = process.env.RNP_CLIENT_ID;
const CLIENT_SECRET = process.env.RNP_CLIENT_SECRET;
const USERNAME = process.env.RNP_USERNAME;
const PASSWORD = process.env.RNP_PASSWORD;


/**
 * Obtém um token utilizando username/password.
 * Deve ser utilizado apenas quando ainda não temos
 * um refresh token válido.
 */
async function obterTokenInicial() {

    const params = new URLSearchParams();

    params.append('grant_type', 'password');
    params.append('username', USERNAME);
    params.append('password', PASSWORD);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const response = await axios.post(
        TOKEN_URL,
        params.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    guardarTokens(response.data);

    return tokenData.accessToken;
}


/**
 * Obtém um novo access token utilizando
 * o refresh token.
 */
async function renovarToken() {

    if (!tokenData.refreshToken) {
        throw new Error('Não existe refresh token disponível.');
    }

    const params = new URLSearchParams();

    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', tokenData.refreshToken);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const response = await axios.post(
        TOKEN_URL,
        params.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    guardarTokens(response.data);

    return tokenData.accessToken;
}


/**
 * Guarda os tokens e calcula a data de expiração
 * do access token.
 */
function guardarTokens(data) {

    tokenData.accessToken = data.access_token;

    // Muito importante:
    // o refresh token pode mudar quando fazemos refresh.
    tokenData.refreshToken = data.refresh_token;

    tokenData.expiresAt =
        Date.now() + ((data.expires_in || 3600) * 1000);
}


/**
 * Devolve um access token válido.
 *
 * Fluxo:
 *
 * 1. Temos access token válido -> utiliza
 * 2. Access token expirou -> refresh token
 * 3. Não temos refresh token -> username/password
 */
async function obterAccessToken() {

    // Ainda temos access token válido
    if (
        tokenData.accessToken &&
        tokenData.expiresAt &&
        Date.now() < tokenData.expiresAt
    ) {
        return tokenData.accessToken;
    }

    // Access token expirou, mas temos refresh token
    if (tokenData.refreshToken) {

        try {
            return await renovarToken();

        } catch (error) {

            console.error(
                'Erro ao renovar token:',
                error.response?.data || error.message
            );

            // O refresh token pode ter expirado.
            // Nesse caso tentamos obter credenciais novamente.
            tokenData = {
                accessToken: null,
                refreshToken: null,
                expiresAt: null
            };
        }
    }

    // Primeiro acesso / refresh token expirado
    return await obterTokenInicial();
}


module.exports = {
    obterAccessToken
};