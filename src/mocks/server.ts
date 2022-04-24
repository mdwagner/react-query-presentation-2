import { rest, setupWorker } from "msw";
import type { Todo } from "../typings";

let id = 0;

function createId() {
  return ++id;
}

const todos: Todo[] = [
  { id: createId(), title: "Go to the Gym" },
  { id: createId(), title: "Do homework" },
  { id: createId(), title: "Go to grocery store" },
];

const handlers = [
  rest.get("/todos", (_req, res, ctx) => {
    try {
      return res(ctx.status(200), ctx.json(todos));
    } catch (_e) {
      return res(ctx.status(500), ctx.json({ status: "error" }));
    }
  }),
  rest.post("/todos", (req, res, ctx) => {
    try {
      const { title } = JSON.parse(req.body as any);
      todos.push({ id: createId(), title });
      return res(ctx.status(200), ctx.json({ status: "success" }));
    } catch (_e) {
      return res(ctx.status(500), ctx.json({ status: "error" }));
    }
  }),
  rest.patch("/todos/:id", (req, res, ctx) => {
    try {
      const { id } = req.params as any;
      const { title } = JSON.parse(req.body as any);
      const todo = todos.find((t) => t.id == id)!;
      todo.title = title;
      return res(ctx.status(200), ctx.json({ status: "success" }));
    } catch (_e) {
      return res(ctx.status(500), ctx.json({ status: "error" }));
    }
  }),
  rest.delete("/todos/:id", (req, res, ctx) => {
    try {
      const { id } = req.params as any;
      const filtered = todos.filter((t) => t.id != id);
      todos.length = 0;
      todos.push(...filtered);
      return res(ctx.status(200), ctx.json({ status: "success" }));
    } catch (_e) {
      return res(ctx.status(500), ctx.json({ status: "error" }));
    }
  }),
];

export const server = setupWorker(...handlers);
