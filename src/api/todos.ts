import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 4105;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const addTodo = ({
  title,
  completed,
}: {
  title: string;
  completed: boolean;
}) => {
  return client.post<Todo>('/todos', {
    title,
    completed,
  });
};

export const deleteTodo = (id: number) => {
  return client.delete(`/todos/${id}`);
};
