# RNP Integration API

API Node.js para:

1. Receber o identificador de um profissional da Área Pessoal.
2. Obter os dados na base de dados MySQL.
3. Validar a consistência dos dados.
4. Construir o XML SOAP.
5. Enviar o pedido para o Web Service RNP/SPMS.
6. Interpretar a resposta e devolver o resultado à aplicação chamadora.

## Requisitos

- Node.js 20+ recomendado
- MySQL
- Acesso ao endpoint SOAP do RNP/SPMS

## Instalação

```bash
npm install
```

Copiar `.env.example` para `.env` e preencher os valores.

```bash
npm start
```

Em desenvolvimento:

```bash
npm run dev
```

## Endpoint

```http
POST /routes/profissional/:id Content-Type: application/json X-API-Key: local-de-acesso-restrito
```

Exemplo:

```bash
curl -X POST http://localhost:8080/routes/rnp/12345 -H "X-API-Key: local-de-acesso-restrito"
```

Resposta de sucesso:

```json
{
  "sucesso": true,
  "estado": "SUCESSO",
  "requestId": "..."
}
```

Erro de validação:

```json
{
  "sucesso": false,
  "estado": "ERRO_VALIDACAO",
  "requestId": "...",
  "erros": [
    "Nome completo é obrigatório"
  ]
}
```

## Onde adaptar à BD

Editar:

`src/models/profissionalModel.js`

A query incluída é apenas um exemplo. Deve ser substituída pelas tabelas/campos reais da Área Pessoal.

## Onde adaptar o SOAP

Editar:

`src/services/rnpService.js`

e:

`src/soap/rnpXml.js`

O namespace e a estrutura foram preparados com base no XML apresentado no projeto.

## Nota sobre operação

O projeto assume inicialmente que a aplicação chamadora espera pela resposta do RNP/SPMS (processamento síncrono).

Se posteriormente for necessário processamento assíncrono, pode ser acrescentada uma fila/tabela de pedidos sem alterar significativamente a API pública.
