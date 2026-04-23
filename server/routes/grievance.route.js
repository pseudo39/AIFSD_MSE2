const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createGrievance,
  getGrievances,
  getGrievanceById,
  updateGrievance,
  deleteGrievance,
} = require('../controllers/grievance.controller');

const router = express.Router();

router.post('/grievances', authMiddleware, createGrievance);
router.get('/grievances', authMiddleware, getGrievances);
router.get('/grievances/:id', authMiddleware, getGrievanceById);
router.put('/grievances/:id', authMiddleware, updateGrievance);
router.delete('/grievances/:id', authMiddleware, deleteGrievance);

module.exports = router;
