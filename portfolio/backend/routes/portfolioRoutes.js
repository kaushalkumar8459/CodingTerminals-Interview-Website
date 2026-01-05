const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

/**
 * Portfolio Routes
 * Base URL: /api/portfolio
 */

// ==================== PUBLIC ROUTES (VIEWER & ADMIN) ====================

/**
 * @route   GET /api/portfolio/stats
 * @desc    Get portfolio statistics
 * @access  Admin Only (should add auth middleware)
 */
router.get('/stats', portfolioController.getPortfolioStats);

/**
 * @route   GET /api/portfolio
 * @desc    Get all portfolio items (with optional filters)
 * @access  Public
 * @query   category, featured, status
 */
router.get('/', portfolioController.getAllPortfolios);

/**
 * @route   GET /api/portfolio/:id
 * @desc    Get portfolio by MongoDB ID
 * @access  Public
 */
router.get('/:id', portfolioController.getPortfolioById);

// ==================== ADMIN ROUTES (CREATE, UPDATE, DELETE) ====================

/**
 * @route   POST /api/portfolio
 * @desc    Create new portfolio item
 * @access  Admin Only
 */
router.post('/', portfolioController.createPortfolio);

/**
 * @route   PUT /api/portfolio/:id
 * @desc    Update portfolio item
 * @access  Admin Only
 */
router.put('/:id', portfolioController.updatePortfolio);

/**
 * @route   DELETE /api/portfolio/:id
 * @desc    Delete portfolio item
 * @access  Admin Only
 */
router.delete('/:id', portfolioController.deletePortfolio);

module.exports = router;