// src/lib/auth.js
const users = {
    admin: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    },
    juez: {
      username: process.env.JUDGE_USERNAME,
      password: process.env.JUDGE_PASSWORD,
      role: 'juez'
    }
  };
  
  export function validateUser(username, password) {
    return Object.values(users).find(
      user => user.username === username && user.password === password
    );
  }
  
  export function isAuthorized(role, requiredRole) {
    if (role === 'admin') return true;
    return role === requiredRole;
  }