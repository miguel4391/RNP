/**
 * Analisa a resposta FHIR devolvida pelo RNP / SPMS
 *
 * Não lança exceções.
 * Apenas interpreta a resposta e devolve um resultado normalizado.
 */
function analisarResposta(bundle) {

    console.log("========================================");
    console.log("ANÁLISE DA RESPOSTA SPMS");
    console.log("========================================");

    if (!bundle) {

        console.error("Resposta SPMS vazia.");

        return {
            sucesso: false,
            tipo: "EMPTY_RESPONSE",
            mensagem: "A SPMS não devolveu uma resposta."
        };
    }


    // ---------------------------------------------------------
    // Validar Bundle
    // ---------------------------------------------------------

    if (bundle.resourceType !== "Bundle") {

        console.error(
            "Resposta não é um Bundle FHIR:",
            bundle.resourceType
        );

        return {
            sucesso: false,
            tipo: "INVALID_RESPONSE",
            mensagem: "A resposta da SPMS não é um Bundle FHIR."
        };
    }


    // ---------------------------------------------------------
    // Dados gerais do Bundle
    // ---------------------------------------------------------

    const bundleId = bundle.id || null;

    console.log("Bundle ID:", bundleId);
    console.log("Bundle Type:", bundle.type);


    // ---------------------------------------------------------
    // Procurar MessageHeader
    // ---------------------------------------------------------

    const messageHeaderEntry =
        bundle.entry?.find(
            entry =>
                entry.resource?.resourceType === "MessageHeader"
        );


    if (!messageHeaderEntry) {

        console.error(
            "MessageHeader não encontrado na resposta."
        );

        return {
            sucesso: false,
            tipo: "INVALID_RESPONSE",
            mensagem: "A resposta não contém MessageHeader.",
            bundleId: bundleId
        };
    }


    const messageHeader =
        messageHeaderEntry.resource;


    console.log(
        "MessageHeader ID:",
        messageHeader.id
    );


    // ---------------------------------------------------------
    // Event
    // ---------------------------------------------------------

    const eventCode =
        messageHeader.eventCoding?.code || null;

    const eventDisplay =
        messageHeader.eventCoding?.display || null;


    console.log(
        "Event:",
        eventCode,
        eventDisplay || ""
    );


    // ---------------------------------------------------------
    // Response
    // ---------------------------------------------------------

    const response =
        messageHeader.response || {};

    const responseCode =
        response.code || null;

    const responseIdentifier =
        response.identifier || null;


    console.log(
        "Response code:",
        responseCode
    );

    console.log(
        "Response identifier:",
        responseIdentifier
    );


    // ---------------------------------------------------------
    // Procurar OperationOutcome
    // ---------------------------------------------------------

    const operationOutcomeEntry =
        bundle.entry?.find(
            entry =>
                entry.resource?.resourceType === "OperationOutcome"
        );


    const operationOutcome =
        operationOutcomeEntry?.resource || null;


    let operationOutcomeId = null;
    let issues = [];


    if (operationOutcome) {

        operationOutcomeId =
            operationOutcome.id || null;

        issues =
            operationOutcome.issue || [];

        console.log(
            "OperationOutcome ID:",
            operationOutcomeId
        );

    }


    // =========================================================
    // Determinar se é sucesso
    // =========================================================

    const codigosSucesso = [
        "ok"
    ];


    const sucesso =
        codigosSucesso.includes(
            String(responseCode).toLowerCase()
        );


    // =========================================================
    // SUCESSO
    // =========================================================

    if (sucesso) {

        console.log(
            "Resultado SPMS: SUCESSO"
        );

        return {

            sucesso: true,

            tipo: "SUCCESS",

            mensagem:
                eventDisplay ||
                "Operação processada com sucesso.",

            bundleId: bundleId,

            messageHeaderId:
                messageHeader.id || null,

            eventCode: eventCode,

            eventDisplay: eventDisplay,

            responseCode: responseCode,

            responseIdentifier:
                responseIdentifier,

            operationOutcomeId:
                operationOutcomeId
        };
    }


    // =========================================================
    // ERRO
    // =========================================================

    console.log(
        "Resultado SPMS: ERRO"
    );


    // ---------------------------------------------------------
    // Obter primeiro erro
    // ---------------------------------------------------------

    const primeiroIssue =
        issues.length > 0
            ? issues[0]
            : null;


    const severity =
        primeiroIssue?.severity || null;

    const issueCode =
        primeiroIssue?.code || null;

    const issueDetails =
        primeiroIssue?.details || {};

    const issueCoding =
        issueDetails.coding?.[0] || null;

    const errorCode =
        issueCoding?.code || null;

    const errorDisplay =
        issueCoding?.display ||
        issueDetails.text ||
        null;


    console.log(
        "Severity:",
        severity
    );

    console.log(
        "Issue code:",
        issueCode
    );

    console.log(
        "Erro SPMS:",
        errorCode,
        errorDisplay || ""
    );


    return {

        sucesso: false,

        tipo: "SPMS_ERROR",

        mensagem:
            errorDisplay ||
            eventDisplay ||
            "A SPMS devolveu um erro.",

        bundleId: bundleId,

        messageHeaderId:
            messageHeader.id || null,

        eventCode: eventCode,

        eventDisplay: eventDisplay,

        responseCode: responseCode,

        responseIdentifier:
            responseIdentifier,

        operationOutcomeId:
            operationOutcomeId,

        severidade: severity,

        codigoIssue: issueCode,

        codigo: errorCode,

        detalhes: errorDisplay,

        issues: issues
    };
}


module.exports = {
    analisarResposta
};