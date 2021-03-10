const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {  
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) return response.status(404).json({error: 'User does not exist!'})

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const user = users.some(user => user.username === username)

  if(user) return response.status(400).json({error: "Username is already registered!"})

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const userIndex = users.indexOf(user)

  const todoAlreadyExists = user.todos.some(todo => todo.id === id)
  
  if(!todoAlreadyExists) return response.status(404).json({error: 'UUID is invalid'})
  
  users[userIndex].todos = user.todos.map(todo => {
    return todo.id === id
    ? {
      ...todo,
      title,
      deadline
    }
    : todo
  })
  
  const todo = users[userIndex].todos.find(todo => todo.id === id)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const userIndex = users.indexOf(user)

  const todoAlreadyExists = user.todos.some(todo => todo.id === id)
  
  if(!todoAlreadyExists) return response.status(404).json({error: 'UUID is invalid'})
  
  users[userIndex].todos = user.todos.map(todo => {
    return todo.id === id
    ? {
      ...todo,
      done: true
    }
    : todo
  })
  
  const todo = users[userIndex].todos.find(todo => todo.id === id)

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoAlreadyExists = user.todos.some(todo => todo.id === id)
  
  if(!todoAlreadyExists) return response.status(404).json({error: 'UUID is invalid'})

  const userIndex = users.indexOf(user)
  const todoIndex = user.todos.find((todo, index) => {
    if(todo.id === id) return index
    return false
  })
  
  user.todos.splice(todoIndex, 1)

  users[userIndex].todos = user.todos
  
  return response.status(204).send()
});

module.exports = app;