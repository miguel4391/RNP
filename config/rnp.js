module.exports = {
    tokenUrl: process.env.RNP_TOKEN_URL,
    bundleUrl: process.env.RNP_BUNDLE_URL,

    organization: {
        senderId: process.env.RNP_SENDER_ORGANIZATION_ID,
        senderName: process.env.RNP_SENDER_ORGANIZATION_NAME,
        senderNif: process.env.RNP_SENDER_NIF
    },

    destination: {
        organizationId: process.env.RNP_DESTINATION_ORGANIZATION_ID,
        organizationName: process.env.RNP_DESTINATION_ORGANIZATION_NAME
    }
};// config/rnp.js

module.exports = {

    // =====================================================
    // OAuth
    // =====================================================

    tokenUrl: process.env.RNP_TOKEN_URL,

    clientId: process.env.RNP_CLIENT_ID,

    clientSecret: process.env.RNP_CLIENT_SECRET,

    username: process.env.RNP_USERNAME,

    password: process.env.RNP_PASSWORD,


    // =====================================================
    // FHIR
    // =====================================================

    processMessageUrl: process.env.RNP_BUNDLE_URL,

    fhirBaseUrl:
        process.env.RNP_FHIR_BASE_URL ||
        "https://spms.min-saude.pt/fhir-r4B",


    // =====================================================
    // Eventos
    // =====================================================

    event: {

        system:
            "https://spms.min-saude.pt/fhir-r4B/iop/events",

        code:
            process.env.RNP_EVENT_CODE,

        display:
            process.env.RNP_EVENT_DISPLAY
    },


    // =====================================================
    // Organização remetente
    // =====================================================

    sender: {

        id:
            process.env.RNP_SENDER_ORGANIZATION_ID,

        name:
            process.env.RNP_SENDER_ORGANIZATION_NAME,

        nif:
            process.env.RNP_SENDER_NIF,

        sourceName:
            process.env.RNP_SOURCE_NAME,

        sourceEndpoint:
            process.env.RNP_SOURCE_ENDPOINT
    },


    // =====================================================
    // Organização destinatária
    // =====================================================

    receiver: {

        id:
            process.env.RNP_RECEIVER_ORGANIZATION_ID,

        name:
            process.env.RNP_RECEIVER_ORGANIZATION_NAME,

        nif:
            process.env.RNP_RECEIVER_NIF,

        destinationName:
            process.env.RNP_DESTINATION_NAME,

        destinationEndpoint:
            process.env.RNP_DESTINATION_ENDPOINT
    },


    // =====================================================
    // Timeouts
    // =====================================================

    timeout: 30000
};