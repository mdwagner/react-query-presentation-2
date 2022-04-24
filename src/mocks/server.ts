import { rest, setupWorker } from "msw";

const handlers = [
  rest.get("/user", (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        name: "Wagz",
        title: "Senior Software Engineer",
        company: "Method",
      })
    );
  }),
];

export const server = setupWorker(...handlers);
