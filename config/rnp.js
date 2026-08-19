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
};