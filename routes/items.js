import express from 'express';
import mongoose from 'mongoose';
import Items from '../models/items.js';
import Orders from '../models/orders.js';

const router = express.Router();

// Paginacja i opcjonalne filtrowanie
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, price } = req.query;
  const query = {};

  if (price) {
    query.price = { $lte: price }; // Filtrowanie po cenie
  }

  try {
    const items = await Items.find(query)
      .skip((page - 1) * limit) // Paginacja
      .limit(Number(limit));

    const totalItems = await Items.countDocuments(query);

    res.status(200).send({
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving items', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { price, name, available } = req.body;

  if (!price || !name || typeof available === 'undefined') {
    return res.status(400).send('Missing required fields');
  }

  try {
    const newItem = await Items.create({ price, name, available });
    res.status(201).send(newItem);
  } catch (error) {
    res.status(500).send({ message: 'Error creating item', error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedItem = await Items.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedItem) {
      return res.status(404).send({ message: `Item with ID ${id} not found` });
    }
    res.status(200).send(updatedItem);
  } catch (error) {
    res.status(500).send({ message: 'Error updating item', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await Items.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).send({ message: `Item with ID ${id} not found` });
    }
    res.status(200).send(deletedItem);
  } catch (error) {
    res.status(500).send({ message: 'Error deleting item', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Items.findById(id);
    if (!item) {
      return res.status(404).send({ message: `Item with ID ${id} not found` });
    }
    res.status(200).send(item);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving item', error: error.message });
  }
});

router.get('/below-price/:price', async (req, res) => {
  const { price } = req.params;

  try {
    const items = await Items.find({ price: { $lt: price } });
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving items below price', error: error.message });
  }
});

// Paginacja dla dostępnych przedmiotów
router.get('/available', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const items = await Items.find({ available: true })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalItems = await Items.countDocuments({ available: true });

    res.status(200).send({
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving available items', error: error.message });
  }
});

router.post('/validate-order', async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).send('No items in order');
  }

  try {
    let totalAmount = 0;
    for (const itemId of items) {
      const item = await Items.findById(itemId);
      if (!item) {
        return res.status(404).send({ message: `Item with ID ${itemId} not found` });
      }
      totalAmount += item.price;
    }

    const newOrder = new Orders({ amount: totalAmount, items });
    await newOrder.save();

    res.status(201).send({ message: 'Order validated', totalAmount, newOrder });
  } catch (error) {
    res.status(500).send({ message: 'Error validating order', error: error.message });
  }
});

export default router;
