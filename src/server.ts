import express from "express";
import methodOverride from "method-override";
import path from "path";
import { Op } from "sequelize";
import { initializeDatabase, Item, Plan, Schedule, User } from "./models";
import type { PlanStatus } from "./models/plan";
import type { ScheduleType } from "./models/schedule";

const app = express();
const port = Number(process.env.PORT || 3000);
const pageSize = 6;
const appRoot = process.cwd();

app.set("view engine", "ejs");
app.set("views", path.join(appRoot, "src", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(appRoot, "src", "public")));

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value: unknown): string | null {
  const text = asString(value);
  return text.length > 0 ? text : null;
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asDate(value: unknown): Date | null {
  const text = asString(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function yen(value: number | null | undefined): string {
  return `¥${Number(value || 0).toLocaleString("ja-JP")}`;
}

function normalizeStatus(value: unknown): PlanStatus {
  return value === "完了" ? "完了" : "計画中";
}

function normalizeScheduleType(value: unknown): ScheduleType {
  return value === "move" ? "move" : "spot";
}

function viewLocals() {
  return {
    formatDate,
    formatDateTime,
    yen
  };
}

function asyncHandler(
  handler: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => Promise<void>
) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

async function loadPlanOr404(id: string) {
  return Plan.findByPk(id, {
    include: [
      { model: Schedule, as: "schedules" },
      { model: Item, as: "items" }
    ],
    order: [[{ model: Schedule, as: "schedules" }, "sortOrder", "ASC"]]
  });
}

async function createSchedulesFromBody(planId: number, body: express.Request["body"]) {
  const names = toArray<string>(body.schedule_name);
  const types = toArray<string>(body.schedule_type);
  const starts = toArray<string>(body.schedule_start_at);
  const ends = toArray<string>(body.schedule_end_at);
  const budgets = toArray<string>(body.schedule_budget);
  const urls = toArray<string>(body.schedule_url);
  const photos = toArray<string>(body.schedule_photo_url);
  const weathers = toArray<string>(body.schedule_weather);
  const outfits = toArray<string>(body.schedule_outfit);
  const fromPlaces = toArray<string>(body.schedule_from_place);
  const toPlaces = toArray<string>(body.schedule_to_place);
  const transportations = toArray<string>(body.schedule_transportation);
  const memos = toArray<string>(body.schedule_memo);

  const currentCount = await Schedule.count({ where: { planId } });
  const schedules = names
    .map((name, index) => ({
      name: asString(name),
      type: normalizeScheduleType(types[index]),
      startAt: asDate(starts[index]),
      endAt: asDate(ends[index]),
      budget: asNumber(budgets[index]),
      url: asNullableString(urls[index]),
      photoUrl: asNullableString(photos[index]),
      weather: asNullableString(weathers[index]),
      outfit: asNullableString(outfits[index]),
      fromPlace: asNullableString(fromPlaces[index]),
      toPlace: asNullableString(toPlaces[index]),
      transportation: asNullableString(transportations[index]),
      memo: asNullableString(memos[index]),
      sortOrder: currentCount + index,
      planId
    }))
    .filter((schedule) => schedule.name.length > 0);

  if (schedules.length > 0) {
    await Schedule.bulkCreate(schedules);
  }
}

async function updateSchedulesFromBody(body: express.Request["body"]) {
  const ids = toArray<string>(body.existing_schedule_id);
  const names = toArray<string>(body.existing_schedule_name);
  const types = toArray<string>(body.existing_schedule_type);
  const starts = toArray<string>(body.existing_schedule_start_at);
  const ends = toArray<string>(body.existing_schedule_end_at);
  const budgets = toArray<string>(body.existing_schedule_budget);
  const urls = toArray<string>(body.existing_schedule_url);
  const photos = toArray<string>(body.existing_schedule_photo_url);
  const weathers = toArray<string>(body.existing_schedule_weather);
  const outfits = toArray<string>(body.existing_schedule_outfit);
  const fromPlaces = toArray<string>(body.existing_schedule_from_place);
  const toPlaces = toArray<string>(body.existing_schedule_to_place);
  const transportations = toArray<string>(body.existing_schedule_transportation);
  const memos = toArray<string>(body.existing_schedule_memo);

  await Promise.all(
    ids.map((id, index) =>
      Schedule.update(
        {
          name: asString(names[index]) || "未入力のスポット",
          type: normalizeScheduleType(types[index]),
          startAt: asDate(starts[index]),
          endAt: asDate(ends[index]),
          budget: asNumber(budgets[index]),
          url: asNullableString(urls[index]),
          photoUrl: asNullableString(photos[index]),
          weather: asNullableString(weathers[index]),
          outfit: asNullableString(outfits[index]),
          fromPlace: asNullableString(fromPlaces[index]),
          toPlace: asNullableString(toPlaces[index]),
          transportation: asNullableString(transportations[index]),
          memo: asNullableString(memos[index])
        },
        { where: { id: asNumber(id) } }
      )
    )
  );
}

app.get("/", (_req, res) => {
  res.redirect("/plans");
});

app.get(
  "/plans",
  asyncHandler(async (req, res) => {
    const keyword = asString(req.query.keyword);
    const status = asString(req.query.status);
    const page = Math.max(1, asNumber(req.query.page) || 1);
    const where: Record<string, unknown> = {};

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    if (status === "計画中" || status === "完了") {
      where.status = status;
    }

    const { rows: plans, count } = await Plan.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["createdAt", "DESC"]]
    });

    res.render("home", {
      title: "旅行計画アプリ（仮）",
      plans,
      keyword,
      status,
      page,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
      ...viewLocals()
    });
  })
);

app.get("/plans/create", (_req, res) => {
  res.render("plancreate", {
    title: "旅行プランを作成する",
    ...viewLocals()
  });
});

app.post(
  "/plans",
  asyncHandler(async (req, res) => {
    const plan = await Plan.create({
      name: asString(req.body.name) || "無題の旅行",
      status: normalizeStatus(req.body.status),
      startedAt: asDate(req.body.started_at),
      endedAt: asDate(req.body.ended_at)
    });

    await createSchedulesFromBody(plan.id, req.body);

    const itemNames = asString(req.body.item_names)
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean);
    if (itemNames.length > 0) {
      await Item.bulkCreate(
        itemNames.map((name) => ({
          planId: plan.id,
          scheduleId: null,
          name
        }))
      );
    }

    res.redirect(`/plans/${plan.id}`);
  })
);

app.get(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const plan = await loadPlanOr404(req.params.id);
    if (!plan) {
      res.status(404).send("Plan not found");
      return;
    }

    const schedules = ((plan as any).schedules || []) as Schedule[];
    const items = ((plan as any).items || []) as Item[];
    const totalBudget = schedules.reduce((sum, schedule) => sum + Number(schedule.budget || 0), 0);
    const packedCount = items.filter((item) => item.packed).length;

    res.render("plan", {
      title: plan.name,
      plan,
      schedules,
      items,
      totalBudget,
      packedCount,
      ...viewLocals()
    });
  })
);

app.post(
  "/plans/:id/delete",
  asyncHandler(async (req, res) => {
    await Plan.destroy({ where: { id: req.params.id } });
    res.redirect("/plans");
  })
);

app.get(
  "/plans/:id/update",
  asyncHandler(async (req, res) => {
    const plan = await loadPlanOr404(req.params.id);
    if (!plan) {
      res.status(404).send("Plan not found");
      return;
    }

    res.render("planupdate", {
      title: `${plan.name}を編集`,
      plan,
      schedules: ((plan as any).schedules || []) as Schedule[],
      items: ((plan as any).items || []) as Item[],
      ...viewLocals()
    });
  })
);

app.post(
  "/plans/:id/update",
  asyncHandler(async (req, res) => {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      res.status(404).send("Plan not found");
      return;
    }

    await plan.update({
      name: asString(req.body.name) || "無題の旅行",
      status: normalizeStatus(req.body.status),
      startedAt: asDate(req.body.started_at),
      endedAt: asDate(req.body.ended_at)
    });

    await updateSchedulesFromBody(req.body);
    await createSchedulesFromBody(plan.id, req.body);
    res.redirect(`/plans/${plan.id}`);
  })
);

app.post(
  "/plans/:id/schedules/:scheduleId/delete",
  asyncHandler(async (req, res) => {
    await Schedule.destroy({
      where: { id: req.params.scheduleId, planId: req.params.id }
    });
    res.redirect(`/plans/${req.params.id}/update`);
  })
);

app.post(
  "/plans/:id/schedules/:scheduleId/move",
  asyncHandler(async (req, res) => {
    const direction = req.body.direction === "down" ? 1 : -1;
    const schedules = await Schedule.findAll({
      where: { planId: req.params.id },
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"]
      ]
    });
    const index = schedules.findIndex((schedule) => schedule.id === asNumber(req.params.scheduleId));
    const targetIndex = index + direction;

    if (index >= 0 && targetIndex >= 0 && targetIndex < schedules.length) {
      const current = schedules[index];
      const target = schedules[targetIndex];
      const currentOrder = current.sortOrder;
      await current.update({ sortOrder: target.sortOrder });
      await target.update({ sortOrder: currentOrder });
    }

    res.redirect(`/plans/${req.params.id}/update`);
  })
);

app.post(
  "/plans/:id/items",
  asyncHandler(async (req, res) => {
    const name = asString(req.body.name);
    if (name) {
      await Item.create({
        planId: asNumber(req.params.id),
        scheduleId: asNumber(req.body.schedule_id) || null,
        name
      });
    }
    res.redirect(`/plans/${req.params.id}`);
  })
);

app.post(
  "/plans/:id/items/:itemId/toggle",
  asyncHandler(async (req, res) => {
    const item = await Item.findOne({
      where: { id: req.params.itemId, planId: req.params.id }
    });
    if (item) {
      await item.update({ packed: !item.packed });
    }
    res.redirect(`/plans/${req.params.id}`);
  })
);

app.post(
  "/plans/:id/items/:itemId/delete",
  asyncHandler(async (req, res) => {
    await Item.destroy({
      where: { id: req.params.itemId, planId: req.params.id }
    });
    res.redirect(`/plans/${req.params.id}`);
  })
);

app.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await User.findAll({ order: [["createdAt", "DESC"]] });
    res.render("users", {
      title: "ユーザー管理",
      users,
      editingUser: null,
      ...viewLocals()
    });
  })
);

app.get(
  "/users/:id/edit",
  asyncHandler(async (req, res) => {
    const users = await User.findAll({ order: [["createdAt", "DESC"]] });
    const editingUser = await User.findByPk(req.params.id);
    res.render("users", {
      title: "ユーザー管理",
      users,
      editingUser,
      ...viewLocals()
    });
  })
);

app.post(
  "/users",
  asyncHandler(async (req, res) => {
    await User.create({
      name: asString(req.body.name),
      email: asString(req.body.email)
    });
    res.redirect("/users");
  })
);

app.post(
  "/users/:id/update",
  asyncHandler(async (req, res) => {
    await User.update(
      {
        name: asString(req.body.name),
        email: asString(req.body.email)
      },
      { where: { id: req.params.id } }
    );
    res.redirect("/users");
  })
);

app.post(
  "/users/:id/delete",
  asyncHandler(async (req, res) => {
    await User.destroy({ where: { id: req.params.id } });
    res.redirect("/users");
  })
);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Travel planner is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
