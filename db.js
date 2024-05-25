const { Sequelize } = require("sequelize");

module.exports = new Sequelize("tg_bot", "postgres", "Vbifvbif2002", {
  host: "localhost",
  port: "5432",
  dialect: "postgres",
});
