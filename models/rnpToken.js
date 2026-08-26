const db = require("../config/db");


async function lerToken() {

    try {

        const [rows] = await db.query(`
            SELECT
                idtoken_rnp,
                access_token,
                token_type,
                expires_in,
                refresh_token,
                obtido_em
            FROM token_rnp
            WHERE idtoken_rnp = 1
            LIMIT 1
        `);

        if (rows.length === 0) {
            return null;
        }

        return rows[0];

    } catch (error) {

        console.error(
            "Erro ao ler token da BD:",
            error.message
        );

        return null;
    }
}


async function guardarToken(tokenData) {

    const dados = {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        refresh_token: tokenData.refresh_token,
        obtido_em: new Date()
    };

    try {

        await db.query(`
            INSERT INTO token_rnp
            (
                idtoken_rnp,
                access_token,
                token_type,
                expires_in,
                refresh_token,
                obtido_em
            )
            VALUES
            (
                1,
                ?,
                ?,
                ?,
                ?,
                ?
            )
            ON DUPLICATE KEY UPDATE
                access_token = VALUES(access_token),
                token_type = VALUES(token_type),
                expires_in = VALUES(expires_in),
                refresh_token = VALUES(refresh_token),
                obtido_em = VALUES(obtido_em)
        `, [
            dados.access_token,
            dados.token_type,
            dados.expires_in,
            dados.refresh_token,
            dados.obtido_em
        ]);

        return dados;

    } catch (error) {

        console.error(
            "Erro ao guardar token na BD:",
            error.message
        );

        throw error;
    }
}


module.exports = {
    lerToken,
    guardarToken
};