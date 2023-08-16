import { Sequelize } from "sequelize";

const db = new Sequelize('suhuf_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
})

export default db;
