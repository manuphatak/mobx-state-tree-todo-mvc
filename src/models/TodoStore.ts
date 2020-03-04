import { types, Instance, destroy, getParentOfType } from "mobx-state-tree"
import { v4 as uuid } from "uuid"

const Todo = types
  .model("Todo", {
    id: types.optional(types.identifier, () => uuid()),
    label: types.string,
    completed: false,
  })
  .actions(self => ({
    remove() {
      getParentOfType(self, TodoStore).removeTodo(self as TodoInstance)
    },
  }))
  .actions(self => ({
    toggle(completed = !self.completed) {
      self.completed = completed
    },
    setLabel(label: string) {
      if (label.length) {
        self.label = label
      } else {
        self.remove()
      }
    },
  }))
export type TodoInstance = Instance<typeof Todo>

export const TodoStore = types
  .model("Root", {
    todos: types.optional(types.array(Todo), []),
  })
  .views(self => ({
    get activeTodos() {
      return self.todos.filter(todo => !todo.completed)
    },
    get completedTodos() {
      return self.todos.filter(todo => todo.completed)
    },
    get allCompleted() {
      return self.todos.every(todo => todo.completed)
    },
  }))
  .views(self => ({
    get activeTodosCount() {
      return self.activeTodos.length
    },
  }))
  .actions(self => ({
    addTodo(name: string, completed = false) {
      self.todos.push(Todo.create({ label: name, completed: completed }))
    },
    removeTodo(todo: TodoInstance) {
      destroy(todo)
    },
    clearCompletedTodos() {
      self.todos.replace(self.todos.filter(todo => !todo.completed))
    },
    toggleAll() {
      const completed = !self.allCompleted
      self.todos.forEach(todo => todo.toggle(completed))
    },
  }))

export type TodoStoreInstance = Instance<typeof TodoStore>
