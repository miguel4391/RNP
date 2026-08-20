require("dotenv").config();

const express = require("express");
//const profissionalRoutes = require("./routes/profissional");
const rnpRoutes = require("./routes/rnp");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
    res.json({
        sucesso: true,
        estado: "OK",
        service: "rnp-integration-api"
    });
});

//app.use("/routes", profissionalRoutes);
app.use("/routes", rnpRoutes);

app.use(errorHandler);

const port = Number(process.env.PORT || 8080);

app.listen(port, () => {
    console.log(`RNP Integration API disponível na porta ${port}`);
});