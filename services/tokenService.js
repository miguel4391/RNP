const axios = require("axios");

let accessToken = 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAifQ.wsDgVNDSTINN4KU_xkPNwQKUrIyu7uu-STbVTCKYLu-QbLc0tW0lyUg6vnOgzM3cta3_ibiIg0r0eQM-hYaUimuB-Q5TnMl3fkvAVYhnijr2BxkvP50W73iwd2DIJCpnoFmBik7gB1ihCG3exUBlDr68f0pR3R4oDFYkJ2umFh49KZ_Navi1v5rKMf746qrSgqDMrJGeR4L88SUraO5NWTTvP_TSosz_0HeksgqW-zhZRQ9h0zHvZg7MqDebu_yWt0Ovk8iBaKwyuFlkg2-DHuEGYZH1crAkw28j-ms5pBJUidja6Tt5xYslS0J8Pvbpc67V5W6j6dPtpH2YNDqizgYILpHT2kStQPVojakpKpghXu4GSe9qqao-oo2Wx2TjQ0aSRV_380TZ7ulTY4uecEIZjl-1fpdbrPTJ4wCqWiPq3i0AAJfkhlOAn4lU2CL46u7iAPjg9fEwJEd_Dd1AUaWgOuebWPQhlILw_dsTbHF3IAtM0CEkfX3tWOF9R4e2.nnqu16Atz9ceKtK9eyXwfg.T-1QKrmq_gMNAeT5RnKtKwmxBkd0OiqD9LG_VXUVHMBESj_gQDfxllYYjwxLp-sNkVK9PHKEvjUbLQy3hmVENRAWnJONDzQ2Mq27mqCMdr3-PrKAJh1C7a2jnii9APciFB446NUkIR9VX2I0N8yQTWHCyPCYB9RQBgczDG6mSZ9hQPxKe89kxyoKUKZF7ouhhiAxUjL8DhITygWupGtAziSqoFIlbHuwNkRUsUeB8vthPfpmcjFmIh0R6vf1c9DZA1Kb8ib21VwULm8Of93GiLWPlRrp1331NPYrW3f3FGxBvFUII94iPEBea86_S49bGAL_v-hZ7yDCam_8dZ0MR77_v-ZMchc7UYh00wL-1hk.i6LD85ogUD-DgNKf4dpjxQ';
let refreshToken = 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAifQ.0Zj_OhT75gkcRp10VhqQpSfelQE-q4gYalOumXxWqCVqVaNYU0SsVBW3y5z4_7eP6QskZarXp0gvOQYXMgHaruGygicc-GRdLmdNak-dicG900kQipJJmSWIiIgP1uV922dvQGNdvNmpVRq6J2gFyRQK_Gk6xdI-Q0lBFoI33RrGhE4zK-RHgWJLcNt5wtXXGUU30YVvbRoBiWxlcSKWlCrBg5XJYE_4bodiNQXzluo7zufYmb6QmCtuQz1XLN9q5cqCvUd21YHYIDDCDrmC0kJ72iBW4tTmiQlV4PNpjXc740-_JL-w0ROv2pS_MvzFiRm-LxZZRJJUy7e0fYY39hqkZlkau1CGEG16av4KMkBPBaZH3nuUggG_NNo46R7cfdCyKRiFu3D1j8zPuAkwjUVHFTElkFkKuolM506QWNsrc9J8ee-0wvrgXCbpoyt0HeqMjibgeKmUV8SZxpwVUBDM87KRsSikq0TaRnC67U02knYDtTo7yjQSqfYdLk0F.z56-bfuYM8sYfU1s1LfARQ.0LFMMjn9p7v3jqCv07fiQM7XHzu9EYR7L5GPb3Yy2OfuRBRr0UvKTyyqrDrDKPlAsiWB4QRENjcArawEoML77ctu1kzbK-2UiGR9Z2bCL7Gav479GCJZnUvuDnWoI_8wKg8VOGAaprsUAjRyqupd0ROdHVz9Phzg4IaqMpKCqDmDZZ0UF5X7gi0TCStan_9YbFV-dE1pQ4dVfJs3Lekf9KVOjkz8hZ1CllWQsqDwCkayJQl-ocw5ZjfkYVRqTYZU-CEJ9hZ2A2INflurLwMd-g.pHIUwhxgoxL8jxYOQatD9g';
let expiresAt = 0;

/**
 * Guarda os tokens recebidos pelo servidor SPMS
 */
function guardarTokens(data) {
    if (!data || !data.token) {
        throw new Error("Resposta de token inválida: access_token não recebido");
    }

    accessToken = data.token;

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