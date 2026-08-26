const crypto = require("crypto");

// ============================================================
// Configuração
// ============================================================

const FHIR_BASE_URL =
    process.env.RNP_FHIR_BASE_URL ||
    "https://spms.min-saude.pt/fhir-r4B";

const PROFILE_BUNDLE =
    "https://spms.min-saude.pt/fhir-r4B/iop/StructureDefinition/BundlePTTRV";

const PROFILE_MESSAGE_HEADER =
    "https://spms.min-saude.pt/fhir-r4B/iop/StructureDefinition/MessageHeaderPTTRV";

const PROFILE_PRACTITIONER =
    "https://spms.min-saude.pt/fhir-r4B/iop/StructureDefinition/PractitionerPTOPSNC";

const PROFILE_ORGANIZATION =
    "https://spms.min-saude.pt/fhir-r4B/iop/StructureDefinition/OrganizationPTTRV";

const EVENT_SYSTEM =
    "https://spms.min-saude.pt/fhir-r4B/iop/events";

const QUALIFICATION_EXTENSION =
    "https://spms.min-saude.pt/fhir/iop/extensions/qualificationPTExtension";

const SNOMED_SYSTEM =
    "http://snomed.info/sct";

const V2_IDENTIFIER_SYSTEM =
    "http://terminology.hl7.org/CodeSystem/v2-0203";

const TAX_SYSTEM =
    "https://www.portaldasfinancas.gov.pt";


// ============================================================
// Funções auxiliares
// ============================================================

function uuid() {
    return crypto.randomUUID();
}


/**
 * Retira propriedades undefined/null de um objeto.
 * Útil para não enviar campos opcionais vazios para a SPMS.
 */
function removeEmpty(value) {

    if (Array.isArray(value)) {
        return value
            .map(removeEmpty)
            .filter(v => v !== undefined && v !== null);
    }

    if (value && typeof value === "object") {

        const result = {};

        for (const [key, val] of Object.entries(value)) {

            const cleaned = removeEmpty(val);

            if (
                cleaned !== undefined &&
                cleaned !== null &&
                !(
                    typeof cleaned === "object" &&
                    !Array.isArray(cleaned) &&
                    Object.keys(cleaned).length === 0
                )
            ) {
                result[key] = cleaned;
            }
        }

        return result;
    }

    return value;
}


/**
 * Converte valores de data para YYYY-MM-DD.
 */
function formatDate(value) {

    if (!value) {
        return undefined;
    }

    if (value instanceof Date) {

        if (isNaN(value.getTime())) {
            return undefined;
        }

        return value.toISOString().substring(0, 10);
    }

    const stringValue = String(value).trim();

    if (!stringValue) {
        return undefined;
    }

    // Já está no formato pretendido
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
        return stringValue;
    }

    const date = new Date(stringValue);

    if (isNaN(date.getTime())) {
        return undefined;
    }

    return date.toISOString().substring(0, 10);
}


/**
 * Cria uma codificação SNOMED.
 */
function snomed(code, display) {

    if (!code && !display) {
        return undefined;
    }

    return {
        coding: [
            removeEmpty({
                system: SNOMED_SYSTEM,
                code,
                display
            })
        ],
        text: display
    };
}


/**
 * Cria o bloco code de uma qualificação.
 */
function qualificationCode(id, code, display) {

    if (!code && !display) {
        return undefined;
    }

    return {
        code: {
            id,
            ...snomed(code, display)
        }
    };
}


/**
 * Constrói a extension qualificationPTExtension.
 */
function buildQualificationExtension(r) {
    
    const extensions = [];

    // --------------------------------------------------------
    // Estado da qualificação
    // --------------------------------------------------------

    let statusCode;
    let statusDisplay;

    const situacao = String(r.situacao || "")
        .trim()
        .toUpperCase();

    if (
        situacao === "SUSPENSO" ||
        situacao === "SUSPENSA" ||
        situacao === "SUSPENDED"
    ) {

        // Exemplo fornecido pela SPMS:
        // 385655000 = Suspended

        statusCode = "385655000";
        statusDisplay = "Suspended";

    } else {

        // Exemplo fornecido pela SPMS:
        // 255594003 = Complete

        statusCode = "255594003";
        statusDisplay = "Complete";
    }

    extensions.push({
        url: "status",
        valueCodeableConcept: {
            coding: [
                {
                    system: SNOMED_SYSTEM,
                    code: statusCode,
                    display: statusDisplay
                }
            ],
            text:
                statusDisplay === "Suspended"
                    ? "Suspenso"
                    : "Concluído"
        }
    });


    // --------------------------------------------------------
    // Data do estado
    // --------------------------------------------------------

    const dataSituacao = formatDate(r.dataSituacao);

    if (dataSituacao) {

        extensions.push({
            url: "statusPeriod",
            valuePeriod: {
                start: dataSituacao
            }
        });
    }


    // --------------------------------------------------------
    // Grau profissional
    // --------------------------------------------------------

    if (
        r.grauProfissionalCodigo ||
        r.grauProfissionalDescricao
    ) {

        extensions.push({
            url: "professionalGradePTExtension",
            valueCodeableConcept: {
                coding: [
                    removeEmpty({
                        system: SNOMED_SYSTEM,
                        code: r.grauProfissionalCodigo,
                        display: r.grauProfissionalDescricao
                    })
                ],
                text: r.grauProfissionalDescricao
            }
        });
    }


    return {
        extension: extensions,
        url: QUALIFICATION_EXTENSION
    };
}


// ============================================================
// Practitioner
// ============================================================

function buildPractitioner(r, practitionerId) {
    
    const identifier = {
        type: {
            coding: [
                {
                    system: V2_IDENTIFIER_SYSTEM,
                    code: "MD",
                    display: "Medical License number"
                }
            ],
            text: "Número da Cédula Profissional do Médico"
        },
        system: "https://ordemdosmedicos.pt/pt",
        value: String(r.nrCedula),
        period: {
            start:
                formatDate(r.dataInscricaoOrdem) ||
                formatDate(r.dataInicioCedula),
            end: formatDate(r.dataFimCedula)
        }
    };


    const qualification = [];


    // --------------------------------------------------------
    // Estado / grau profissional
    // --------------------------------------------------------

    qualification.push({
        extension: [
            buildQualificationExtension(r)
        ],
        code: qualificationCode(
            "professionalTitle",
            r.categoriaCodigo || "309343006",
            r.categoriaDescricao || "Médico"
        )
    });


    // --------------------------------------------------------
    // Especialidade
    // --------------------------------------------------------

    if (
        r.especialidadeCodigo ||
        r.especialidadeDescricao
    ) {

        qualification.push(
            qualificationCode(
                "medicalSpecialty",
                r.especialidadeCodigo,
                r.especialidadeDescricao
            )
        );
    }


    // --------------------------------------------------------
    // Subespecialidade
    // --------------------------------------------------------

    if (
        r.subEspecialidadeCodigo ||
        r.subEspecialidadeDescricao
    ) {

        qualification.push(
            qualificationCode(
                "medicalSubSpecialty",
                r.subEspecialidadeCodigo,
                r.subEspecialidadeDescricao
            )
        );
    }


    // --------------------------------------------------------
    // Competência
    // --------------------------------------------------------

    /* if (
        r.competenciaCodigo ||
        r.competenciaDescricao
    ) {

        qualification.push(
            qualificationCode(
                "medicalCompetence",
                r.competenciaCodigo,
                r.competenciaDescricao
            )
        );
    } */


    return removeEmpty({

        resourceType: "Practitioner",

        id: practitionerId,

        meta: {
            profile: [
                PROFILE_PRACTITIONER
            ]
        },

        identifier: [
            identifier
        ],

        /*
         * Nos exemplos fornecidos pela SPMS:
         *
         * active = true
         *
         * mesmo no exemplo de médico suspenso.
         *
         * Portanto não estamos a utilizar "situacao"
         * diretamente para determinar active.
         */
        active: true,

        name: [
            {
                use: "usual",
                text: r.nome
            }
        ],

        telecom:[
            {
                system: "email",
                value: r.email,
                use: "work",
                rank: 1
            }
        ],

        birthDate: formatDate(r.dtaNasc),

        qualification
    });
}


// ============================================================
// Organization
// ============================================================

function buildOrganization({
    id,
    nif,
    nome
}) {

    return removeEmpty({

        resourceType: "Organization",

        id,

        meta: {
            lastUpdated: new Date().toISOString(),
            profile: [
                PROFILE_ORGANIZATION
            ]
        },

        identifier: [
            {
                type: {
                    coding: [
                        {
                            system: V2_IDENTIFIER_SYSTEM,
                            code: "TAX",
                            display: "Tax ID Number"
                        }
                    ],
                    text:
                        "Número de Identificação de Pessoa Coletiva"
                },

                system: TAX_SYSTEM,

                value: String(nif)
            }
        ],

        name: nome
    });
}


// ============================================================
// MessageHeader
// ============================================================

function buildMessageHeader({
    messageHeaderId,
    practitionerId,
    receiverOrganizationId,
    receiverOrganizationName,
    senderOrganizationId,
    senderOrganizationName
}) {

    return removeEmpty({

        resourceType: "MessageHeader",

        id: messageHeaderId,

        meta: {
            lastUpdated: new Date().toISOString(),

            profile: [
                PROFILE_MESSAGE_HEADER
            ]
        },

        eventCoding: {
            system: EVENT_SYSTEM,

            code: process.env.RNP_EVENT_CODE,

            display: process.env.RNP_EVENT_DISPLAY
        },

        destination: [
            {
                name:
                    process.env.RNP_DESTINATION_NAME ||
                    "sistema-nacional",

                endpoint:
                    process.env.RNP_DESTINATION_ENDPOINT,

                receiver: {
                    reference:
                        `${receiverOrganizationId}`,

                    display:
                        receiverOrganizationName
                }
            }
        ],

        sender: {
            reference:
                `${senderOrganizationId}`,

            display:
                senderOrganizationName
        },

        source: {
            name:
                process.env.RNP_SOURCE_NAME,

            endpoint:
                process.env.RNP_SOURCE_ENDPOINT
        },

        focus: [
            {
                reference:
                    `Practitioner/${practitionerId}`
            }
        ]
    });
}


// ============================================================
// Bundle
// ============================================================

function buildBundle(r) {

    const bundleId = uuid();

    const messageHeaderId = uuid();

    const practitionerId = uuid();

    const receiverOrganizationId =
        process.env.RNP_RECEIVER_ORGANIZATION_ID;

    const senderOrganizationId =
        process.env.RNP_SENDER_ORGANIZATION_ID;


    const receiverOrganizationName =
        process.env.RNP_RECEIVER_ORGANIZATION_NAME;

    const senderOrganizationName =
        process.env.RNP_SENDER_ORGANIZATION_NAME;


    // --------------------------------------------------------
    // Practitioner
    // --------------------------------------------------------

    const practitioner =
        buildPractitioner(
            r,
            practitionerId
        );


    // --------------------------------------------------------
    // MessageHeader
    // --------------------------------------------------------

    const messageHeader =
        buildMessageHeader({
            messageHeaderId,
            practitionerId,
            receiverOrganizationId,
            receiverOrganizationName,
            senderOrganizationId,
            senderOrganizationName
        });


    // --------------------------------------------------------
    // Organizations
    // --------------------------------------------------------

    const receiverOrganization =
        buildOrganization({
            id: receiverOrganizationId,
            nif: process.env.RNP_RECEIVER_NIF,
            nome: receiverOrganizationName
        });


    const senderOrganization =
        buildOrganization({
            id: senderOrganizationId,
            nif: process.env.x,
            nome: senderOrganizationName
        });


    // --------------------------------------------------------
    // Bundle
    // --------------------------------------------------------

    const bundle = {

        resourceType: "Bundle",

        id: bundleId,

        meta: {
            lastUpdated: new Date().toISOString(),

            profile: [
                PROFILE_BUNDLE
            ]
        },

        type: "message",

        entry: [

            // MessageHeader
            {
                fullUrl:
                    `${FHIR_BASE_URL}/MessageHeader/${messageHeaderId}`,

                resource:
                    messageHeader
            },

            // Practitioner
            {
                fullUrl:
                    `${FHIR_BASE_URL}/Practitioner/${practitionerId}`,

                resource:
                    practitioner
            },

            // Organization destinatária
            {
                fullUrl:
                    `${FHIR_BASE_URL}/Organization/${receiverOrganizationId}`,

                resource:
                    receiverOrganization
            },

            // Organization remetente
            {
                fullUrl:
                    `${FHIR_BASE_URL}/Organization/${senderOrganizationId}`,

                resource:
                    senderOrganization
            }
        ]
    };


    return removeEmpty(bundle);
}


// ============================================================
// Export
// ============================================================

module.exports = {
    buildBundle,
    buildPractitioner,
    buildMessageHeader,
    buildOrganization,
    formatDate
};