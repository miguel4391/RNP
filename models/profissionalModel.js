const db = require("../config/db");

async function getProfissional(idMedico) {

    // Dados do médico
    const [medicos] = await db.query(
        `
        SELECT
            nome_clinico,
            nif,
            cedula,
            email_81,
            data_nascimento,
            data_inscricao
        FROM medicos
        WHERE cod_sitc < 7 AND cedula = ?
        `,
        [idMedico]
    );

    if (medicos.length === 0) {
        return null;
    }

    const medico = medicos[0];

    // Especialidades
    const [especialidades] = await db.query(
        `
        SELECT
            e.idespecialidade,
            e.codSPMS,
            e.nome,
            e.nomeEng
        FROM tr_med_esp me
        INNER JOIN especialidades e
            ON e.idespecialidade = me.idEspecialidade
        WHERE me.idMedico = ? and e.estado like '0'
        ORDER BY e.nome
        `,
        [idMedico]
    );

    // Subespecialidades
    const [subespecialidades] = await db.query(
        `
        SELECT
            s.idsubespecialidade,
            s.codSPMS,
            s.nome,
            s.nomeEng
        FROM tr_med_sub ms
        INNER JOIN subespecialidade s
            ON s.idsubespecialidade = ms.idSubEspecialidade
        WHERE ms.idMedico = ? and s.estado like '0'
        ORDER BY s.nome
        `,
        [idMedico]
    );

    // Competências
    const [competencias] = await db.query(
        `
        SELECT
            c.idcompetencias,
            c.codSPMS,
            c.nome,
            c.nomeEng
        FROM tr_med_comp mc
        INNER JOIN competencias c
            ON c.idcompetencias = mc.idCompetencia
        WHERE mc.idMedico = ? and c.estado like '0'
        ORDER BY c.nome
        `,
        [idMedico]
    );

    return {
        ...medico,
        especialidades,
        subespecialidades,
        competencias
    };
}

module.exports = {
    getProfissional
};