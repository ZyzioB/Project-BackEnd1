import express from 'express';
import mongoose from 'mongoose';  
import Orders from '../models/orders.js'; 
import { verifyToken } from '../middleware/auth.js';  // Middleware do weryfikacji tokenu JWT

const router = express.Router();

// GET: Pobranie wszystkich zamówień (dla admina)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Tylko administratorzy mogą pobrać wszystkie zamówienia
    if (req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }
    
    const orders = await Orders.find(); 
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving orders', error: error.message });
  }
});

// GET: Pobranie zamówienia po ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);

    if (!order) {
      return res.status(404).send({ message: `Order with ID ${req.params.id} not found` });
    }

    // Użytkownicy mogą pobrać tylko swoje zamówienie
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    res.status(200).send(order);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving order', error: error.message });
  }
});

// POST: Dodanie zamówienia (autentykacja)
router.post('/', verifyToken, async (req, res) => {
  const { amount, title, items } = req.body;

  if (!amount || !title || !items) {
    return res.status(400).send('Missing required fields');
  }

  try {
    // Tworzenie nowego zamówienia
    const newOrder = await Orders.create({
      amount,
      title,
      userId: req.user.id,  // ID użytkownika pobrane z tokenu
      status: 'pending',     // Status na początek
      items
    });
    res.status(201).send(newOrder);
  } catch (error) {
    res.status(500).send({ message: 'Error creating order', error: error.message });
  }
});

// PATCH: Edytowanie zamówienia (autentykacja i autoryzacja)
router.patch('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const order = await Orders.findById(id);

    if (!order) {
      return res.status(404).send({ message: `Order with ID ${id} not found` });
    }

    // Użytkownicy mogą edytować tylko swoje zamówienia
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    // Aktualizacja zamówienia
    const updatedOrder = await Orders.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).send(updatedOrder);
  } catch (error) {
    res.status(500).send({ message: 'Error updating order', error: error.message });
  }
});

// DELETE: Usunięcie zamówienia (autentykacja i autoryzacja)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Orders.findById(id);

    if (!order) {
      return res.status(404).send({ message: `Order with ID ${id} not found` });
    }

    // Użytkownicy mogą usuwać tylko swoje zamówienia
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    // Usuwanie zamówienia
    const deletedOrder = await Orders.findByIdAndDelete(id);
    res.status(200).send({ message: 'Order deleted', deletedOrder });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting order', error: error.message });
  }
});

// GET: Pobranie zamówień konkretnego użytkownika
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Sprawdzenie, czy użytkownik ma dostęp do swoich zamówień
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    const orders = await Orders.find({ userId });
    res.status(200).send({ orders });
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving orders for user', error: error.message });
  }
});

export default router;
