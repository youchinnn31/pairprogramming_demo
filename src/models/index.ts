import { Item } from "./item";
import { Plan } from "./plan";
import { Schedule } from "./schedule";
import { User } from "./user";

Plan.hasMany(Schedule, {
  foreignKey: "planId",
  as: "schedules",
  onDelete: "CASCADE"
});
Schedule.belongsTo(Plan, {
  foreignKey: "planId",
  as: "plan"
});

Plan.hasMany(Item, {
  foreignKey: "planId",
  as: "items",
  onDelete: "CASCADE"
});
Item.belongsTo(Plan, {
  foreignKey: "planId",
  as: "plan"
});

Schedule.hasMany(Item, {
  foreignKey: "scheduleId",
  as: "items",
  onDelete: "SET NULL"
});
Item.belongsTo(Schedule, {
  foreignKey: "scheduleId",
  as: "schedule"
});

export { initializeDatabase, sequelize } from "./db";
export { Item } from "./item";
export { Plan } from "./plan";
export { Schedule } from "./schedule";
export { User } from "./user";
