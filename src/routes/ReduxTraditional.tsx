import { useEffect } from "react";
import { configureStore, ThunkAction, AnyAction } from "@reduxjs/toolkit";
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

const START_LOADING = "example/startLoading";
const STOP_LOADING = "example/stopLoading";
const SAVE_ERROR = "example/saveError";
const SAVE_TODOS = "example/saveTodos";
const SAVE_TEMP_TODO = "example/saveTempTodo";
const CLEAR_TEMP_TODO = "example/clearTempTodo";
const SAVE_NEW_TODO = "example/saveNewTodo";
const CLEAR_NEW_TODO = "example/clearNewTodo";

function startLoading() {
  return {
    type: START_LOADING,
  };
}
function stopLoading() {
  return {
    type: STOP_LOADING,
  };
}
function saveError(message: string) {
  return {
    type: SAVE_ERROR,
    payload: message,
  };
}
function saveTodos(todos: Todo[]) {
  return {
    type: SAVE_TODOS,
    payload: todos,
  };
}
function saveTempTodo(todo: Todo) {
  return {
    type: SAVE_TEMP_TODO,
    payload: todo,
  };
}
function clearTempTodo() {
  return {
    type: CLEAR_TEMP_TODO,
  };
}
function saveNewTodo(title: string) {
  return {
    type: SAVE_NEW_TODO,
    payload: title,
  };
}
function clearNewTodo() {
  return { type: CLEAR_NEW_TODO };
}

function exampleReducer(state = initState, action: AnyAction) {
  switch (action.type) {
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    case SAVE_ERROR:
      return { ...state, error: action.payload };
    case SAVE_TODOS:
      return { ...state, todos: action.payload };
    case SAVE_TEMP_TODO:
      return { ...state, tempTodo: action.payload };
    case CLEAR_TEMP_TODO:
      return { ...state, tempTodo: null };
    case SAVE_NEW_TODO:
      return { ...state, newTodo: action.payload };
    case CLEAR_NEW_TODO:
      return { ...state, newTodo: "" };
    default:
      return state;
  }
}

const store = configureStore({
  reducer: exampleReducer,
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

function fetchTodos(): ThunkAction<void, RootState, unknown, AnyAction> {
  return (dispatch) => {
    dispatch(startLoading());
    fetch("/todos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        return response.json();
      })
      .then((body) => {
        dispatch(stopLoading());
        dispatch(saveTodos(body));
      })
      .catch((err) => {
        dispatch(saveError(err.message));
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };
}
function createTodo(): ThunkAction<void, RootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    fetch("/todos", {
      method: "POST",
      body: JSON.stringify({
        title: getState().newTodo,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        return response.json();
      })
      .then(() => {
        dispatch(clearNewTodo());
        dispatch(fetchTodos());
      })
      .catch((err) => {
        dispatch(saveError(err.message));
      });
  };
}
function updateTodo(): ThunkAction<void, RootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const todo = getState().tempTodo!;
    fetch(`/todos/${todo.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: todo.title,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        return response.json();
      })
      .then(() => {
        dispatch(clearTempTodo());
        dispatch(fetchTodos());
      })
      .catch((err) => {
        dispatch(saveError(err.message));
      });
  };
}
function removeTodo(
  id: number
): ThunkAction<void, RootState, unknown, AnyAction> {
  return (dispatch) => {
    fetch(`/todos/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        return response.json();
      })
      .then(() => {
        dispatch(fetchTodos());
      })
      .catch((err) => {
        dispatch(saveError(err.message));
      });
  };
}

function ReduxTraditional() {
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
                saveTempTodo({ id: state.tempTodo.id, title: e.target.value })
              );
            } else {
              dispatch(saveNewTodo(e.target.value));
            }
          }}
        />
        {state.tempTodo ? (
          <button
            className="px-3 text-white bg-blue-400 disabled:bg-blue-200 hover:bg-blue-600 rounded-xl"
            onClick={() => dispatch(clearTempTodo())}
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
                onClick={() => dispatch(saveTempTodo(t))}
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

function ReduxTraditionalRoot() {
  return (
    <Provider store={store}>
      <ReduxTraditional />
    </Provider>
  );
}

export default ReduxTraditionalRoot;
