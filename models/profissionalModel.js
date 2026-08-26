const db = require("../config/db");

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
        nome: r.nome,
        email: r.email,
        dataNascimento: r.dtaNasc,
        nrCedula: r.nrCedula,
        nif: r.nif,
        "especialidades": [
            {
                "especialidadeCodigo": "394579002",
                "especialidadeDescricaoEng": "Cardiologia",
                "especialidadeDescricao": "Cardiology"
            },
            {
                "especialidadeCodigo": "394582007",
                "especialidadeDescricaoEng": "Dermatology",
                "especialidadeDescricao": "Dermato-venereologia"
            }
        ],
        "subespecialidades": [
            {
                "subespecialidadeCodigo": "394579002",
                "subespecialidadeDescricaoEng": "Cardiologia",
                "especialidadeDescricao": "Cardiology"
            },
            {
                "subespecialidadeCodigo": "394582007",
                "subespecialidadeDescricaoEng": "Dermatology",
                "especialidadeDescricao": "Dermato-venereologia"
            }
        ],
        "competencias": [
            {
                "competenciaCodigo": "394579002",
                "competenciaDescricaoEng": "Cardiologia",
                "competenciaDescricao": "Cardiology"
            },
            {
                "competenciaCodigo": "394582007",
                "competenciaDescricaoEng": "Dermatology",
                "competenciaDescricao": "Dermato-venereologia"
            }
        ],
        "tituloProfissional": {
            "tituloCodigo": "394579002",
            "tituloDescricaoEng": "Physician",
            "tituloDescricao": "Médico"
        }
    } */
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
