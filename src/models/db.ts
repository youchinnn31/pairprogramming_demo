import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(dataDir, "travel.sqlite"),
  logging: false
});

export async function initializeDatabase() {
  await sequelize.sync();
}
