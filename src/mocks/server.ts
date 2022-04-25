import { faker } from "@faker-js/faker";
import { rest, setupWorker } from "msw";

import type { Todo, User, Team, Project } from "../typings";

let id = 0;

function createId() {
  return ++id;
}

const todos: Todo[] = [
  { id: createId(), title: "Go to the Gym" },
  { id: createId(), title: "Do homework" },
  { id: createId(), title: "Go to grocery store" },
];

function createArray<T>(count: number, cb: () => T): T[] {
  return Array.from(Array(count), cb);
}

const users = createArray<User>(5, () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  return {
    id: faker.datatype.uuid(),
    firstName,
    lastName,
    userName: faker.internet.userName(firstName, lastName),
    age: faker.datatype.number({ min: 18, max: 80 }),
    avatarUrl: faker.internet.avatar(),
    email: faker.internet.email(firstName, lastName),
  };
});
const teams = createArray<Team>(3, () => {
  const userIds = users.map(({ id }) => id);
  const members = faker.random.arrayElements(userIds);
  return {
    id: faker.datatype.uuid(),
    name: faker.hacker.abbreviation(),
    department: faker.commerce.department(),
    members,
  };
});
const projects = createArray<Project>(4, () => {
  const teamIds = teams.map(({ id }) => id);
  const team = faker.random.arrayElement(teamIds);
  return {
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    goalStatement: faker.company.bs(),
    team,
  };
});

const handlers = [
  rest.get("/todos", (_req, res, ctx) => {
    try {
      return res(ctx.delay(), ctx.status(200), ctx.json(todos));
    } catch (_e) {
      return res(ctx.delay(), ctx.status(500), ctx.json({ status: "error" }));
    }
  }),
  rest.post("/todos", (req, res, ctx) => {
    try {
      const { title } = JSON.parse(req.body as any);
      todos.push({ id: createId(), title });
      return res(ctx.delay(), ctx.status(200), ctx.json({ status: "success" }));
    } catch (_e) {
      return res(ctx.delay(), ctx.status(500), ctx.json({ status: "error" }));
    }
  }),
  rest.patch("/todos/:id", (req, res, ctx) => {
    try {
      const { id } = req.params as any;
      const { title } = JSON.parse(req.body as any);
      const todo = todos.find((t) => t.id == id)!;
      todo.title = title;
      return res(ctx.delay(), ctx.status(200), ctx.json({ status: "success" }));
    } catch (_e) {
      return res(ctx.delay(), ctx.status(500), ctx.json({ status: "error" }));
    }
  }),
  rest.delete("/todos/:id", (req, res, ctx) => {
    try {
      const { id } = req.params as any;
      const filtered = todos.filter((t) => t.id != id);
      todos.length = 0;
      todos.push(...filtered);
      return res(ctx.delay(), ctx.status(200), ctx.json({ status: "success" }));
    } catch (_e) {
      return res(ctx.delay(), ctx.status(500), ctx.json({ status: "error" }));
    }
  }),
  rest.get("/users", (_req, res, ctx) => {
    return res(ctx.delay(), ctx.status(200), ctx.json(users));
  }),
  rest.get("/teams", (_req, res, ctx) => {
    return res(ctx.delay(), ctx.status(200), ctx.json(teams));
  }),
  rest.get("/projects", (_req, res, ctx) => {
    return res(ctx.delay(), ctx.status(200), ctx.json(projects));
  }),
];

export const server = setupWorker(...handlers);
