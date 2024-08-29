const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userFound = users.find(users => users.username === username);

  if (!userFound) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.userFound = userFound;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.some(users => users.username === username);

  if (usernameExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/users', (request, response) => {

  response.status(200).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userFound } = request;

  response.status(200).json(userFound.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { userFound } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  userFound.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { userFound } = request;

  const todoIndex = userFound.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const todoUpdated = {
    ...userFound.todos[todoIndex],
    title,
    deadline: new Date(deadline)
  };

  userFound.todos[todoIndex] = todoUpdated;

  return response.status(200).json(todoUpdated);
});


app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userFound } = request;

  const todoIndex = userFound.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const todoUpdated = {
    ...userFound.todos[todoIndex],
    done: true,
  };

  userFound.todos[todoIndex] = todoUpdated;

  return response.status(200).json(todoUpdated);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userFound } = request;

  const todoIndex = userFound.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  userFound.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;