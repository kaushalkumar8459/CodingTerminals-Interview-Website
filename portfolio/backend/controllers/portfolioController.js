const Portfolio = require('../models/Portfolio');

/**
 * Portfolio Controller
 * Handles all CRUD operations for portfolio items
 */
class PortfolioController {
    
    /**
     * Get all portfolio items
     * GET /api/portfolio
     * VIEWER & ADMIN ACCESS
     */
    async getAllPortfolios(req, res) {
        try {
            const { category, featured, status } = req.query;
            
            // Build filter object
            const filter = {};
            if (category) filter.category = category;
            if (featured) filter.featured = featured === 'true';
            if (status) filter.status = status;
            
            const portfolios = await Portfolio
                .find(filter)
                .sort({ order: 1, createdAt: -1 })
                .lean();
            
            res.json({
                success: true,
                count: portfolios.length,
                data: portfolios
            });
        } catch (error) {
            console.error('❌ Error fetching portfolios:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get portfolio by ID
     * GET /api/portfolio/:id
     * VIEWER & ADMIN ACCESS
     */
    async getPortfolioById(req, res) {
        try {
            const { id } = req.params;
            const portfolio = await Portfolio.findById(id);
            
            if (!portfolio) {
                return res.status(404).json({
                    success: false,
                    error: 'Portfolio item not found'
                });
            }
            
            res.json({
                success: true,
                data: portfolio
            });
        } catch (error) {
            console.error('❌ Error fetching portfolio:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Create new portfolio item
     * POST /api/portfolio
     * ADMIN ONLY
     */
    async createPortfolio(req, res) {
        try {
            const portfolioData = req.body;
            
            // Validate required fields
            if (!portfolioData.title || !portfolioData.description) {
                return res.status(400).json({
                    success: false,
                    error: 'Title and description are required'
                });
            }
            
            // Generate portfolioId if not provided
            if (!portfolioData.portfolioId) {
                portfolioData.portfolioId = 'portfolio_' + Date.now();
            }
            
            const portfolio = new Portfolio(portfolioData);
            await portfolio.save();
            
            console.log('✅ Portfolio created:', portfolio.portfolioId);
            
            res.status(201).json({
                success: true,
                message: 'Portfolio item created successfully',
                data: portfolio
            });
        } catch (error) {
            console.error('❌ Error creating portfolio:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    details: Object.values(error.errors).map(err => err.message)
                });
            }
            
            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    error: 'Portfolio with this ID already exists'
                });
            }
            
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update portfolio item
     * PUT /api/portfolio/:id
     * ADMIN ONLY
     */
    async updatePortfolio(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const portfolio = await Portfolio.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!portfolio) {
                return res.status(404).json({
                    success: false,
                    error: 'Portfolio item not found'
                });
            }
            
            console.log('✅ Portfolio updated:', portfolio.portfolioId);
            
            res.json({
                success: true,
                message: 'Portfolio item updated successfully',
                data: portfolio
            });
        } catch (error) {
            console.error('❌ Error updating portfolio:', error);
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    details: Object.values(error.errors).map(err => err.message)
                });
            }
            
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete portfolio item
     * DELETE /api/portfolio/:id
     * ADMIN ONLY
     */
    async deletePortfolio(req, res) {
        try {
            const { id } = req.params;
            const portfolio = await Portfolio.findByIdAndDelete(id);
            
            if (!portfolio) {
                return res.status(404).json({
                    success: false,
                    error: 'Portfolio item not found'
                });
            }
            
            console.log('✅ Portfolio deleted:', portfolio.portfolioId);
            
            res.json({
                success: true,
                message: 'Portfolio item deleted successfully'
            });
        } catch (error) {
            console.error('❌ Error deleting portfolio:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get portfolio statistics
     * GET /api/portfolio/stats
     * ADMIN ONLY
     */
    async getPortfolioStats(req, res) {
        try {
            const total = await Portfolio.countDocuments();
            const featured = await Portfolio.countDocuments({ featured: true });
            const byCategory = await Portfolio.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]);
            const byStatus = await Portfolio.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);
            
            res.json({
                success: true,
                data: {
                    total,
                    featured,
                    byCategory,
                    byStatus
                }
            });
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new PortfolioController();