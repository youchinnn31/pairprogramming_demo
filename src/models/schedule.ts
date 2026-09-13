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

export type ScheduleType = "spot" | "move";

export class Schedule extends Model<
  InferAttributes<Schedule>,
  InferCreationAttributes<Schedule>
> {
  declare id: CreationOptional<number>;
  declare planId: ForeignKey<Plan["id"]>;
  declare type: CreationOptional<ScheduleType>;
  declare name: string;
  declare startAt: Date | null;
  declare endAt: Date | null;
  declare sortOrder: CreationOptional<number>;
  declare url: string | null;
  declare budget: CreationOptional<number>;
  declare fromPlace: string | null;
  declare toPlace: string | null;
  declare transportation: string | null;
  declare memo: string | null;
  declare photoUrl: string | null;
  declare weather: string | null;
  declare outfit: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Schedule.init(
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
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "spot",
      validate: {
        isIn: [["spot", "move"]]
      }
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "start_at"
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "end_at"
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order"
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    budget: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    fromPlace: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "from_place"
    },
    toPlace: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "to_place"
    },
    transportation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "photo_url"
    },
    weather: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    outfit: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: "schedules",
    underscored: true
  }
);
