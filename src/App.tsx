/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { Todo } from './types/Todo';
import { getTodos, deleteTodo } from './api/todos';
import { AppHeader } from './components/app-header';
import { Error } from './components/error';
import { AppFooter } from './components/app-footer';
import { ToDo } from './components/todo';
import { Errors } from './types/errors';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredTodos = todos?.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  const isCompletedTodos = todos?.some(todo => todo.completed);

  const removeTodo = (id: number) => {
    setLoadingIds(prev => [...prev, id]);
    setError(null);

    deleteTodo(id)
      .then(() => {
        setTodos(prev => (prev ? prev.filter(t => t.id !== id) : null));
      })
      .catch(() => {
        setError(Errors.errorDelete);
      })
      .finally(() => {
        setLoadingIds(prev => prev.filter(itemId => itemId !== id));
        setTimeout(() => inputRef.current?.focus(), 0);
      });
  };

  const onClearCompleted = () => {
    todos?.filter(todo => todo.completed).forEach(todo => removeTodo(todo.id));
  };

  useEffect(() => {
    setError(null);
    setIsLoading(true);

    getTodos()
      .then(res => setTodos(res))
      .catch(() => setError(Errors.errorLoad))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <AppHeader
        setError={setError}
        setTodos={setTodos}
        setTempTodo={setTempTodo}
        inputRef={inputRef}
      />
      <div className="todoapp__content">
        {!isLoading && (
          <section className="todoapp__main" data-cy="TodoList">
            {filteredTodos?.map(todo => (
              <ToDo
                todo={todo}
                key={todo.id}
                onDelete={removeTodo}
                isLoading={loadingIds.includes(todo.id)}
              />
            ))}
            {tempTodo && (
              <div
                data-cy="Todo"
                className={`todo ${tempTodo.completed ? 'completed' : ''}`}
              >
                <label
                  className="todo__status-label"
                  htmlFor={`todo-status-${tempTodo.id}`}
                >
                  <input
                    id={`todo-status-${tempTodo.id}`}
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={tempTodo.completed}
                    aria-label="Toggle todo status"
                    onChange={() => {}}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {tempTodo.title}
                </span>

                {/* overlay will cover the todo while it is being deleted or updated */}
                <div data-cy="TodoLoader" className="modal overlay is-active">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Hide the footer if there are no todos */}
        {todos?.length && (
          <AppFooter
            todos={todos}
            filter={filter}
            setFilter={setFilter}
            onClearCompleted={onClearCompleted}
            isCompletedTodos={isCompletedTodos}
          />
        )}
      </div>

      <Error error={error} setError={setError} />
    </div>
  );
};
