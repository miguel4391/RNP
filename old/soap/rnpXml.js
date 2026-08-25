const { create } = require("xmlbuilder2");

const NS_SOAP =
    "http://schemas.xmlsoap.org/soap/envelope/";

const NS_WS =
    "http://xmlns.oracle.com/RNP_WS_11g/WS_RNP_RegistaAtualizaProfissional/WS_RNP_RegistaAtualizaProfissional";

function criarXmlSoap(prof) {

    const root = create({
        version: "1.0",
        encoding: "UTF-8"
    })
        .ele("soapenv:Envelope", {
            "xmlns:soapenv": NS_SOAP,
            "xmlns:ws": NS_WS
        });

    root.ele("soapenv:Header");

    const body = root.ele("soapenv:Body");
    const process = body.ele("ws:process");

    const auth = process.ele("ws:AUTENTICACAO");

    addElement(auth, "ws:USER_SECURITY", prof.autenticacao.userSecurity);
    addElement(auth, "ws:USER_APL_EXTERNO", prof.autenticacao.userAplicacao);

    const profissional = process.ele("ws:PROFISSIONAL");

    addElement(profissional, "ws:OPERACAO", prof.operacao);
    addElement(profissional, "ws:PIN", prof.pin);

    const identificacao = profissional.ele("ws:IDENTIFICACAO");

    addElement(
        identificacao,
        "ws:NOME_COMPLETO",
        prof.identificacao.nomeCompleto
    );

    addOptionalElement(
        identificacao,
        "ws:NOME_CLINICO",
        prof.identificacao.nomeClinico
    );

    addElement(
        identificacao,
        "ws:DATA_NASC",
        prof.identificacao.dataNascimento
    );

    addElement(
        identificacao,
        "ws:SEXO",
        prof.identificacao.sexo
    );

    addElement(
        identificacao,
        "ws:NCEDULA",
        prof.identificacao.cedula
    );

    const profissao = profissional.ele("ws:PROFISSAO");

    addCodigoDescricao(
        profissao,
        "ws:ESPECIALIDADE",
        prof.profissao.especialidade
    );

    addCodigoDescricao(
        profissao,
        "ws:CAT_PROFISSIONAL",
        prof.profissao.categoria
    );

    addElement(
        profissao,
        "ws:SIT_PROFISSIONAL",
        prof.profissao.situacao
    );

    addElement(
        profissao,
        "ws:DTA_SIT_PROFISSIONAL",
        prof.profissao.dataSituacao
    );

    const contactos = profissional.ele("ws:CONTACTOS");

    addElement(
        contactos,
        "ws:TELEMOVEL",
        prof.contactos.telemovel
    );

    addElement(
        contactos,
        "ws:EMAIL",
        prof.contactos.email
    );

    const morada = profissional.ele("ws:MORADA");

    addElement(
        morada,
        "ws:RUA",
        prof.morada.rua
    );

    addCodigoDescricao(
        morada,
        "ws:DISTRITO",
        prof.morada.distrito
    );

    addCodigoDescricao(
        morada,
        "ws:CONCELHO",
        prof.morada.concelho
    );

    addCodigoDescricao(
        morada,
        "ws:FREGUESIA",
        prof.morada.freguesia
    );

    addElement(
        morada,
        "ws:CODIGO_POSTAL",
        prof.morada.codigoPostal
    );

    addElement(
        morada,
        "ws:SEQ_POSTAL",
        prof.morada.seqPostal
    );

    addElement(
        morada,
        "ws:LOCALIDADE",
        prof.morada.localidade
    );

    addElement(
        profissional,
        "ws:DTA_INSCR_ORDEM",
        prof.dataInscricaoOrdem
    );

    let xml = root.end({
        prettyPrint: true
    });

    xml = xml.replace(/^<\?xml[^>]*\?>\s*/, '');

    return xml;
}

function addElement(parent, name, value) {
    parent.ele(name).txt(value == null ? "" : String(value)).up();
}

function addOptionalElement(parent, name, value) {
    if (value !== undefined && value !== null && value !== "") {
        addElement(parent, name, value);
    }
}

function addCodigoDescricao(parent, name, obj) {

    const element = parent.ele(name);

    element.ele("ws:CODIGO")
        .txt(obj.codigo == null ? "" : String(obj.codigo))
        .up();

    if (
        obj.descricao !== undefined &&
        obj.descricao !== null &&
        obj.descricao !== ""
    ) {
        element.ele("ws:DESCRICAO")
            .txt(String(obj.descricao))
            .up();
    }

    element.up();
}

module.exports = {
    criarXmlSoap
};
