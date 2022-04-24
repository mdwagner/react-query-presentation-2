import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "react-query";
import type { Todo } from "../typings";

function ReactQueryBasic() {
  const client = useQueryClient();
  const [newTodo, setNewTodo] = useState("");
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const todosQuery = useQuery<Todo[], Error>(["todos"], async () => {
    const response = await fetch("/todos");
    if (!response.ok) {
      throw new Error("Something went wrong");
    }
    return await response.json();
  });
  const createTodoMutation = useMutation<unknown, Error, string>(
    async (newTitle) => {
      const response = await fetch("/todos", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
        }),
      });
      if (!response.ok) {
        throw new Error("Something went wrong");
      }
      return null;
    },
    {
      onSuccess: async () => {
        await client.invalidateQueries(["todos"]);
      },
    }
  );
  const updateTodoMutation = useMutation<unknown, Error, Todo>(
    async (todo) => {
      const response = await fetch(`/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: todo.title,
        }),
      });
      if (!response.ok) {
        throw new Error("Something went wrong");
      }
      return null;
    },
    {
      onSuccess: async () => {
        await client.invalidateQueries(["todos"]);
      },
    }
  );
  const removeTodoMutation = useMutation<unknown, Error, number>(
    async (id) => {
      const response = await fetch(`/todos/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Something went wrong");
      }
    },
    {
      onSuccess: async () => {
        await client.invalidateQueries(["todos"]);
      },
    }
  );

  if (todosQuery.isLoading) {
    return <>Loading...</>;
  }

  if (
    todosQuery.isError ||
    createTodoMutation.isError ||
    updateTodoMutation.isError ||
    removeTodoMutation.isError
  ) {
    return (
      <div>
        <span className="font-bold">Error: </span>
        {todosQuery.error?.message ||
          createTodoMutation.error?.message ||
          updateTodoMutation.error?.message ||
          removeTodoMutation.error?.message ||
          null}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 leading-6">
      <div className="flex items-center">
        <input
          id="create-todo"
          type="text"
          className="border-2 border-gray-400 mx-2"
          value={tempTodo ? tempTodo!.title : newTodo}
          onChange={(e) => {
            if (tempTodo) {
              setTempTodo({ id: tempTodo.id, title: e.target.value });
            } else {
              setNewTodo(e.target.value);
            }
          }}
        />
        {tempTodo ? (
          <button
            className="px-3 text-white bg-blue-400 disabled:bg-blue-200 hover:bg-blue-600 rounded-xl"
            onClick={() => setTempTodo(null)}
          >
            Cancel
          </button>
        ) : null}
        <button
          disabled={tempTodo ? false : !newTodo}
          className="px-3 text-white bg-blue-400 disabled:bg-blue-200 hover:bg-blue-600 rounded-xl"
          onClick={() => {
            if (tempTodo) {
              updateTodoMutation.mutate(tempTodo, {
                onSuccess: () => setTempTodo(null),
              });
            } else {
              createTodoMutation.mutate(newTodo);
            }
          }}
        >
          {tempTodo ? "Update" : "Create"}
        </button>
      </div>
      <div className="flex flex-col space-y-2">
        {todosQuery.data?.map((t) => {
          return (
            <div key={t.id}>
              <span>{t.id}</span>
              <span className="mx-2">-</span>
              <span>{t.title}</span>
              <button
                className="px-3 ml-2 text-white bg-red-400 hover:bg-red-600 rounded-xl"
                onClick={() => setTempTodo(t)}
              >
                Edit
              </button>
              <button
                className="px-3 ml-2 text-white bg-red-400 hover:bg-red-600 rounded-xl"
                onClick={() => removeTodoMutation.mutate(t.id)}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReactQueryBasicRoot() {
  const [queryClient] = useState(new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryBasic />
    </QueryClientProvider>
  );
}

export default ReactQueryBasicRoot;
