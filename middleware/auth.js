import jwt from 'jsonwebtoken';
import { Roles } from '../constants.js';  
import Whitelist from '../models/whitelist.js';  // Model do whitelisty tokenów

// Middleware weryfikujący token
export const verifyToken = (req, res, next) => {
  // Pobieramy token z nagłówka Authorization
  const token = req.header('Authorization')?.replace('Bearer ', ''); 

  if (!token) {
    return res.status(401).send({ message: 'Access denied. No token provided.' });
  }

  // Sprawdzamy, czy token jest na liście whitelist
  Whitelist.findOne({ token })
    .then((whitelistedToken) => {
      if (!whitelistedToken) {
        return res.status(403).send({ message: 'Token is not whitelisted.' });
      }

      // Jeśli token jest na whitelist, weryfikujemy go
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Dekodowanie tokenu
        req.user = decoded;  // Zapisujemy dane użytkownika z tokenu w req.user
        next();  // Przechodzimy do kolejnej funkcji (kontrolera)
      } catch (error) {
        return res.status(400).send({ message: 'Invalid token.' });
      }
    })
    .catch((error) => res.status(500).send({ message: 'Server error', error: error.message }));
};

// Middleware sprawdzający, czy użytkownik ma rolę ADMIN
export const authorizeAdmin = (req, res, next) => {
  // Sprawdzamy, czy użytkownik ma rolę ADMIN
  if (req.user.role !== Roles.ADMIN) {
    return res.status(403).send({ message: 'Access denied. Admins only.' });
  }
  next();  // Użytkownik ma rolę ADMIN, więc kontynuujemy
};
