const express = require('express');
const router = express.Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const searchController = require('./searchController');

// Busca global. Rota pública. asyncHandler: o controller é async, e um erro
// do banco precisa chegar ao errorHandler em vez de derrubar a requisição.
router.get('/search', asyncHandler(searchController.search));

module.exports = router;
