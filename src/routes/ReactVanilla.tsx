import { useState, useEffect, useReducer } from "react";
import type { Todo } from "../typings";

export function ReactVanilla() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [key, forceUpdate] = useReducer(() => ({}), {});
  const [newTodo, setNewTodo] = useState("");
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  useEffect(() => {
    setLoading(true);

    fetch("/todos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        return response.json();
      })
      .then((body) => {
        setLoading(false);
        setTodos(body);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key]);

  function removeTodo(id: number) {
    fetch(`/todos/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        return response.json();
      })
      .then(() => {
        forceUpdate();
      })
      .catch((err) => {
        setError(err.message);
      });
  }

  function createTodo() {
    const title = newTodo;
    setNewTodo("");
    fetch("/todos", {
      method: "POST",
      body: JSON.stringify({
        title,
      }),
    })
      .then(() => {
        forceUpdate();
      })
      .catch((err) => {
        setError(err.message);
      });
  }

  function updateTodo() {
    const todo = tempTodo!;
    fetch(`/todos/${todo.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: todo.title,
      }),
    })
      .then(() => {
        setTempTodo(null);
        forceUpdate();
      })
      .catch((err) => {
        setError(err.message);
      });
  }

  function setupEditTodo(todo: Todo) {
    setTempTodo(todo);
  }

  if (loading) {
    return <>Loading...</>;
  }

  if (error) {
    return (
      <div>
        <span className="font-bold">Error: </span>
        {error}
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
          value={tempTodo ? tempTodo.title : newTodo}
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
          onClick={() => (tempTodo ? updateTodo() : createTodo())}
        >
          {tempTodo ? "Update" : "Create"}
        </button>
      </div>
      <div className="flex flex-col space-y-2">
        {todos.map((t) => {
          return (
            <div key={t.id}>
              <span>{t.id}</span>
              <span className="mx-2">-</span>
              <span>{t.title}</span>
              <button
                className="px-3 ml-2 text-white bg-red-400 hover:bg-red-600 rounded-xl"
                onClick={() => setupEditTodo(t)}
              >
                Edit
              </button>
              <button
                className="px-3 ml-2 text-white bg-red-400 hover:bg-red-600 rounded-xl"
                onClick={() => removeTodo(t.id)}
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
