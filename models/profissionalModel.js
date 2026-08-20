const db = require("../database/db");

async function getProfissional(idProfissional) {

    /*
     * ESTA QUERY É UM EXEMPLO.
     *
     * Substituir pelas tabelas e campos reais da Área Pessoal.
     *
     * A ideia é devolver UMA linha já com os códigos e descrições
     * necessários para construir o objeto profissional.
     */

    const sql = `
        SELECT
            p.id,
            p.pin,
            p.operacao,

            p.nome_completo AS nomeCompleto,
            p.nome_clinico AS nomeClinico,
            p.data_nascimento AS dataNascimento,
            p.sexo,
            p.cedula,

            e.codigo AS especialidadeCodigo,
            e.descricao AS especialidadeDescricao,

            c.codigo AS categoriaCodigo,
            c.descricao AS categoriaDescricao,

            p.situacao,
            p.data_situacao AS dataSituacao,

            p.telemovel,
            p.email,

            p.rua,

            d.codigo AS distritoCodigo,
            d.descricao AS distritoDescricao,

            co.codigo AS concelhoCodigo,
            co.descricao AS concelhoDescricao,

            f.codigo AS freguesiaCodigo,
            f.descricao AS freguesiaDescricao,

            p.codigo_postal AS codigoPostal,
            p.seq_postal AS seqPostal,
            p.localidade,

            p.data_inscricao_ordem AS dataInscricaoOrdem

        FROM profissional p

        LEFT JOIN especialidade e
            ON e.id = p.id_especialidade

        LEFT JOIN categoria c
            ON c.id = p.id_categoria

        LEFT JOIN distrito d
            ON d.id = p.id_distrito

        LEFT JOIN concelho co
            ON co.id = p.id_concelho

        LEFT JOIN freguesia f
            ON f.id = p.id_freguesia

        WHERE p.id = ?
        LIMIT 1
    `;

    //const [rows] = await db.execute(sql, [idProfissional]);

    //if (!rows.length) {
    //    return null;
    //}

    //const r = rows[0];
    const r = require("../data/profissional.json"); // Simulação de dados para teste
    return r;
    //console.log("Dados do profissional:", r);
    /* return {
        autenticacao: {
            userSecurity: process.env.RNP_USER_SECURITY,
            userAplicacao: process.env.RNP_USER_APLICACAO
        },

        operacao: r.operacao || "U",

        pin: r.pin,

        identificacao: {
            nomeCompleto: r.nomeCompleto,
            nomeClinico: r.nomeClinico,
            dataNascimento: formatDate(r.dataNascimento),
            sexo: r.sexo,
            cedula: r.cedula
        },

        profissao: {
            especialidade: {
                codigo: r.especialidadeCodigo,
                descricao: r.especialidadeDescricao
            },

            categoria: {
                codigo: r.categoriaCodigo,
                descricao: r.categoriaDescricao
            },

            situacao: r.situacao,
            dataSituacao: formatDate(r.dataSituacao)
        },

        contactos: {
            telemovel: r.telemovel,
            email: r.email
        },

        morada: {
            rua: r.rua,

            distrito: {
                codigo: r.distritoCodigo,
                descricao: r.distritoDescricao
            },

            concelho: {
                codigo: r.concelhoCodigo,
                descricao: r.concelhoDescricao
            },

            freguesia: {
                codigo: r.freguesiaCodigo,
                descricao: r.freguesiaDescricao
            },

            codigoPostal: r.codigoPostal,
            seqPostal: r.seqPostal,
            localidade: r.localidade
        },

        dataInscricaoOrdem: formatDate(r.dataInscricaoOrdem)
    }; */
}

function formatDate(value) {

    if (!value) {
        return "";
    }

    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return String(value).substring(0, 10);
}

module.exports = {
    getProfissional
};
