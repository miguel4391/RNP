const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const { criarXmlSoap } = require("../soap/rnpXml");
const { obterAccessToken } = require('./tokenService');



const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: false
});

async function enviarProfissional(profissional, requestId) {

    const xml = criarXmlSoap(profissional);

    console.log("XML SOAP a enviar:", xml);

    const headers = {
        "Content-Type": "text/xml; charset=utf-8",
        "Accept": "text/xml"
    };

    if (process.env.RNP_SOAP_ACTION) {
        headers["SOAPAction"] = process.env.RNP_SOAP_ACTION;
    }


    const accessToken = await obterAccessToken();

    // Envia o pedido para o Web Service RNP a solicitar o token de acesso. O token é incluído no cabeçalho Authorization.
    const response = await axios.post(
        RNP_URL,
        xml,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/xml'
            }
        }
    );

    try {
        const response = await axios.post(
            process.env.RNP_URL,
            xml,
            {
                headers,
                timeout: Number(process.env.RNP_TIMEOUT || 30000),
                validateStatus: () => true
            }
        );

        const resultado = interpretarResposta(
            response.data,
            response.status
        );


        if (!resultado.sucesso) {
            return {
                sucesso: false,
                estado: "ERRO_SPMS",
                httpStatus: response.status,
                mensagem: resultado.mensagem
            };
        }

        return {
            sucesso: true,
            estado: "SUCESSO",
            httpStatus: response.status,
            mensagem: resultado.mensagem
        };

    } catch (erro) {
        return {
            sucesso: false,
            estado: "ERRO_SPMS",
            mensagem: erro.code === "ECONNABORTED"
                ? "Timeout na comunicação com o Web Service RNP."
                : "Não foi possível comunicar com o Web Service RNP."
        };
    }
}

function interpretarResposta(xml, httpStatus) {

    if (!xml) {
        return {
            sucesso: false,
            mensagem: `Resposta vazia do Web Service (HTTP ${httpStatus}).`
        };
    }

    try {
        const parsed = parser.parse(xml);
        const fault = procurarChave(parsed, "Fault");

        if (fault) {
            const faultString =
                fault.faultstring ||
                fault.detail ||
                "SOAP Fault devolvido pelo Web Service.";

            return {
                sucesso: false,
                mensagem: typeof faultString === "string"
                    ? faultString
                    : JSON.stringify(faultString)
            };
        }

        /*
         * IMPORTANTE:
         * A estrutura exata da resposta do RNP deve ser confirmada
         * na documentação/WSDL.
         *
         * Por agora, HTTP 2xx sem SOAP Fault é considerado sucesso.
         * Quando tiveres a resposta real, esta função deve ser ajustada
         * para verificar explicitamente o código/estado devolvido pelo RNP.
         */

        if (httpStatus >= 200 && httpStatus < 300) {
            return {
                sucesso: true,
                mensagem: "Pedido aceite pelo Web Service."
            };
        }

        return {
            sucesso: false,
            mensagem: `Web Service devolveu HTTP ${httpStatus}.`
        };

    } catch {
        return {
            sucesso: false,
            mensagem: "Resposta do Web Service não é XML válido."
        };
    }
}

function procurarChave(obj, chave) {

    if (!obj || typeof obj !== "object") {
        return null;
    }

    for (const key of Object.keys(obj)) {

        if (key === chave) {
            return obj[key];
        }

        const encontrado = procurarChave(obj[key], chave);

        if (encontrado) {
            return encontrado;
        }
    }

    return null;
}

module.exports = {
    enviarProfissional
};
