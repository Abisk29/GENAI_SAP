const USERS_KEY = 'users';

const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = (email, password) => {
  const users = getUsers();
  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    return { success: false, message: 'User already exists' };
  }
  users.push({ email, password });
  saveUsers(users);
  return { success: true, message: 'User registered successfully' };
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find((user) => user.email === email && user.password === password);
  if (user) {
    return { success: true, message: 'Login successful' };
  }
  return { success: false, message: 'Invalid email or password' };
};
