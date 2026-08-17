const { z } = require("zod");

const codigoDescricaoSchema = z.object({
    codigo: z.string().trim().min(1),
    descricao: z.string().trim().optional().or(z.literal(""))
});

const profissionalSchema = z.object({

    autenticacao: z.object({
        userSecurity: z.string().min(1),
        userAplicacao: z.string().min(1)
    }),

    operacao: z.enum(["I", "U"]),

    pin: z.string().min(1),

    identificacao: z.object({
        nomeCompleto: z.string().trim().min(1),
        nomeClinico: z.string().trim().optional().or(z.literal("")),
        dataNascimento: z.string().regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Data de nascimento deve estar no formato YYYY-MM-DD"
        ),
        sexo: z.enum(["M", "F"]),
        cedula: z.string().trim().min(1)
    }),

    profissao: z.object({
        especialidade: codigoDescricaoSchema,
        categoria: codigoDescricaoSchema,
        situacao: z.string().trim().min(1),
        dataSituacao: z.string().regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Data de situação deve estar no formato YYYY-MM-DD"
        )
    }),

    contactos: z.object({
        telemovel: z.string().trim().min(1),
        email: z.string().email()
    }),

    morada: z.object({
        rua: z.string().trim().min(1),

        distrito: codigoDescricaoSchema,
        concelho: codigoDescricaoSchema,
        freguesia: codigoDescricaoSchema,

        codigoPostal: z.string().regex(
            /^\d{4}$/,
            "Código postal deve ter 4 dígitos"
        ),

        seqPostal: z.string().regex(
            /^\d{3}$/,
            "Sequência postal deve ter 3 dígitos"
        ),

        localidade: z.string().trim().min(1)
    }),

    dataInscricaoOrdem: z.string().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Data de inscrição deve estar no formato YYYY-MM-DD"
    )
});

function validarProfissional(profissional) {

    const resultado = profissionalSchema.safeParse(profissional);

    if (resultado.success) {
        return {
            success: true,
            data: resultado.data
        };
    }

    return {
        success: false,
        errors: resultado.error.issues.map(issue => {
            return `${issue.path.join(".")}: ${issue.message}`;
        })
    };
}

module.exports = {
    validarProfissional,
    profissionalSchema
};
