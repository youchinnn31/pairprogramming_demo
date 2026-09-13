import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize";
import { sequelize } from "./db";

export type PlanStatus = "計画中" | "完了";

export class Plan extends Model<
  InferAttributes<Plan>,
  InferCreationAttributes<Plan>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare status: CreationOptional<PlanStatus>;
  declare startedAt: Date | null;
  declare endedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Plan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "計画中",
      validate: {
        isIn: [["計画中", "完了"]]
      }
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "started_at"
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "ended_at"
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
    tableName: "plans",
    underscored: true
  }
);
