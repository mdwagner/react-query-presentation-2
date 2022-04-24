import { useEffect } from "react";
import {
  configureStore,
  createSlice,
  PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { Provider, useSelector, useDispatch } from "react-redux";
import type { Todo } from "../typings";

interface ExampleState {
  todos: Todo[];
  loading: boolean;
  error: string;
  tempTodo: Todo | null;
  newTodo: string;
}

const initState: ExampleState = {
  todos: [],
  loading: false,
  error: "",
  tempTodo: null,
  newTodo: "",
};

const fetchTodos = createAsyncThunk<Todo[]>("example/fetchTodos", async () => {
  const response = await fetch("/todos");
  if (!response.ok) {
    throw new Error("Something went wrong");
  }
  return await response.json();
});
const createTodo = createAsyncThunk(
  "example/createTodo",
  async (_arg, { getState, dispatch }) => {
    const state = getState() as ExampleState;
    const response = await fetch("/todos", {
      method: "POST",
      body: JSON.stringify({
        title: state.newTodo,
      }),
    });
    if (!response.ok) {
      throw new Error("Something went wrong");
    }
    dispatch(fetchTodos());
  }
);
const updateTodo = createAsyncThunk(
  "example/updateTodo",
  async (_arg, { getState, dispatch }) => {
    const state = getState() as ExampleState;
    const todo = state.tempTodo!;
    const response = await fetch(`/todos/${todo.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: todo.title,
      }),
    });
    if (!response.ok) {
      throw new Error("Something went wrong");
    }
    dispatch(fetchTodos());
  }
);
const removeTodo = createAsyncThunk(
  "example/removeTodo",
  async (id: number, { dispatch }) => {
    const response = await fetch(`/todos/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Something went wrong");
    }
    dispatch(fetchTodos());
  }
);

const { actions, reducer } = createSlice({
  initialState: initState,
  name: "example",
  reducers: {
    saveTempTodo(state, action: PayloadAction<Todo>) {
      state.tempTodo = action.payload;
    },
    clearTempTodo(state) {
      state.tempTodo = null;
    },
    saveNewTodo(state, action: PayloadAction<string>) {
      state.newTodo = action.payload;
    },
    clearNewTodo(state) {
      state.newTodo = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.error = action.error.message || "";
      })
      .addCase(createTodo.fulfilled, (state) => {
        state.newTodo = "";
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.error = action.error.message || "";
      })
      .addCase(updateTodo.fulfilled, (state) => {
        state.tempTodo = null;
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.error = action.error.message || "";
      })
      .addCase(removeTodo.rejected, (state, action) => {
        state.error = action.error.message || "";
      });
  },
});

const store = configureStore({
  reducer,
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

function ReduxToolkit() {
  const state = useSelector((rootState: RootState) => rootState);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchTodos());
  }, []);

  if (state.loading) {
    return <>Loading...</>;
  }

  if (state.error) {
    return (
      <div>
        <span className="font-bold">Error: </span>
        {state.error}
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
          value={state.tempTodo ? state.tempTodo!.title : state.newTodo}
          onChange={(e) => {
            if (state.tempTodo) {
              dispatch(
                actions.saveTempTodo({
                  id: state.tempTodo.id,
                  title: e.target.value,
                })
              );
            } else {
              dispatch(actions.saveNewTodo(e.target.value));
            }
          }}
        />
        {state.tempTodo ? (
          <button
            className="px-3 text-white bg-blue-400 disabled:bg-blue-200 hover:bg-blue-600 rounded-xl"
            onClick={() => dispatch(actions.clearTempTodo())}
          >
            Cancel
          </button>
        ) : null}
        <button
          disabled={state.tempTodo ? false : !state.newTodo}
          className="px-3 text-white bg-blue-400 disabled:bg-blue-200 hover:bg-blue-600 rounded-xl"
          onClick={() =>
            state.tempTodo ? dispatch(updateTodo()) : dispatch(createTodo())
          }
        >
          {state.tempTodo ? "Update" : "Create"}
        </button>
      </div>
      <div className="flex flex-col space-y-2">
        {state.todos.map((t) => {
          return (
            <div key={t.id}>
              <span>{t.id}</span>
              <span className="mx-2">-</span>
              <span>{t.title}</span>
              <button
                className="px-3 ml-2 text-white bg-red-400 hover:bg-red-600 rounded-xl"
                onClick={() => dispatch(actions.saveTempTodo(t))}
              >
                Edit
              </button>
              <button
                className="px-3 ml-2 text-white bg-red-400 hover:bg-red-600 rounded-xl"
                onClick={() => dispatch(removeTodo(t.id))}
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

function ReduxToolkitRoot() {
  return (
    <Provider store={store}>
      <ReduxToolkit />
    </Provider>
  );
}

export default ReduxToolkitRoot;
