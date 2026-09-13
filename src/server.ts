import express from "express";
import methodOverride from "method-override";
import path from "path";

const app = express();
const port = Number(process.env.PORT || 3000);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.redirect("/plans");
});

app.get("/plans", (_req, res) => {
  res.render("home", { title: "旅行計画アプリ（仮）" });
});

app.listen(port, () => {
  console.log(`Travel planner is running at http://localhost:${port}`);
});
