const axios = require("axios");
const fs = require("fs");
const path = require("path");
const qs = require("querystring");

const TOKEN_FILE = path.join(__dirname, "../config/token.json");


/**
 * Lê o token guardado em ficheiro
 */
function lerToken() {

    try {

        if (!fs.existsSync(TOKEN_FILE)) {
            return null;
        }

        const conteudo = fs.readFileSync(TOKEN_FILE, "utf8");

        if (!conteudo.trim()) {
            return null;
        }

        return JSON.parse(conteudo);

    } catch (error) {

        console.error(
            "Erro ao ler ficheiro de token:",
            error.message
        );

        return null;
    }
}


/**
 * Guarda o token em ficheiro
 */
function guardarToken(tokenData) {

    const dados = {
        ...tokenData,

        // Momento em que o token foi obtido
        obtido_em: new Date().toISOString()
    };

    fs.writeFileSync(
        TOKEN_FILE,
        JSON.stringify(dados, null, 2),
        "utf8"
    );

    return dados;
}


/**
 * Verifica se o access_token ainda é válido
 *
 * Utilizamos uma margem de segurança de 60 segundos.
 */
function tokenValido(tokenData) {

    if (!tokenData) {
        return false;
    }

    if (!tokenData.access_token) {
        return false;
    }

    if (!tokenData.expires_in) {
        return false;
    }

    if (!tokenData.obtido_em) {
        return false;
    }

    const obtidoEm =
        new Date(tokenData.obtido_em).getTime();

    const validade =
        obtidoEm + (Number(tokenData.expires_in) * 1000);

    const agora = Date.now();

    // Margem de segurança: 60 segundos
    return agora < (validade - 60000);
}


/**
 * Obtém o primeiro token utilizando
 * username + password
 */
async function obterNovoToken() {

    const dados = {
        grant_type: "password",
        username: process.env.RNP_USERNAME,
        password: process.env.RNP_PASSWORD,
        client_id: process.env.RNP_CLIENT_ID,
        client_secret: process.env.RNP_CLIENT_SECRET,
        scope: process.env.RNP_SCOPE
    };

    try {

        const response = await axios.post(
            process.env.RNP_TOKEN_URL,
            qs.stringify(dados),
            {
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                }
            }
        );

        return guardarToken(response.data);

    } catch (error) {

        console.error(
            "Erro ao obter novo token:",
            error.response?.data || error.message
        );

        throw error;
    }
}


/**
 * Obtém um novo access_token utilizando
 * o refresh_token existente
 */
async function renovarToken(refreshToken) {

    const dados = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.RNP_CLIENT_ID,
        client_secret: process.env.RNP_CLIENT_SECRET
    };

    try {

        const response = await axios.post(
            process.env.RNP_TOKEN_URL,
            qs.stringify(dados),
            {
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                }
            }
        );

        return guardarToken(response.data);

    } catch (error) {

        console.error(
            "Erro ao renovar token:",
            error.response?.data || error.message
        );

        throw error;
    }
}


/**
 * Função principal utilizada pelo rnpService
 */
async function obterAccessToken() {

    const tokenData = lerToken();


    // --------------------------------------------------
    // 1. Temos um access_token válido
    // --------------------------------------------------

    if (tokenValido(tokenData)) {

        return tokenData.access_token;
    }


    // --------------------------------------------------
    // 2. O access_token expirou mas temos refresh_token
    // --------------------------------------------------

    if (tokenData?.refresh_token) {

        try {

            const novoToken =
                await renovarToken(tokenData.refresh_token);

            return novoToken.access_token;

        } catch (error) {

            console.warn(
                "Não foi possível utilizar o refresh_token."
            );

            // Continua para obter um novo token
            // através de username/password
        }
    }


    // --------------------------------------------------
    // 3. Não temos token ou o refresh falhou
    // --------------------------------------------------

    const novoToken =
        await obterNovoToken();

    return novoToken.access_token;
}


module.exports = {
    obterAccessToken
};