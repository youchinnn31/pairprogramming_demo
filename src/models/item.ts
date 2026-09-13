import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize";
import { sequelize } from "./db";
import { Plan } from "./plan";
import { Schedule } from "./schedule";

export class Item extends Model<
  InferAttributes<Item>,
  InferCreationAttributes<Item>
> {
  declare id: CreationOptional<number>;
  declare planId: ForeignKey<Plan["id"]>;
  declare scheduleId: ForeignKey<Schedule["id"]> | null;
  declare name: string;
  declare packed: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "plan_id",
      references: {
        model: Plan,
        key: "id"
      }
    },
    scheduleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "schedule_id",
      references: {
        model: Schedule,
        key: "id"
      }
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    packed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at"
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at"
    }
  },
  {
    sequelize,
    tableName: "items",
    underscored: true
  }
);
