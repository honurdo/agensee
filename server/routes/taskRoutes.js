const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// Hata yakalama için bir wrapper fonksiyon
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Tüm taskları getir
router.get('/', auth, asyncHandler(taskController.getTasks));

// Yeni task oluştur
router.post('/', auth, asyncHandler(taskController.createTask));

// Belirli bir task'ı getir
router.get('/:id', auth, asyncHandler(taskController.getTaskById));

// Task güncelle
router.put('/:id', auth, asyncHandler(taskController.updateTask));

// Task sil
router.delete('/:id', auth, asyncHandler(taskController.deleteTask));

module.exports = router;