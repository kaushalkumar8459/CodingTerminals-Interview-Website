/**
 * Backup Controller
 * Handles backup operations for MongoDB collections
 * Supports dynamic collection management for backups
 */

const mongoose = require('mongoose');

/**
 * Get all documents from a specific collection
 * GET /api/notes/backup/:collectionName or /api/videos/backup/:collectionName
 */
exports.getBackupCollection = async (req, res) => {
    try {
        const { collectionName } = req.params;
        
        // Validate collection name
        if (!collectionName) {
            return res.status(400).json({ error: 'Collection name is required' });
        }
        
        // Get the collection directly from MongoDB
        const collection = mongoose.connection.db.collection(collectionName);
        
        // Fetch all documents
        const documents = await collection.find({}).toArray();
        
        res.json(documents);
    } catch (error) {
        console.error('Error fetching backup collection:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Save/Replace all documents in a specific collection
 * POST /api/notes/backup/:collectionName or /api/videos/backup/:collectionName
 */
exports.saveBackupCollection = async (req, res) => {
    try {
        const { collectionName } = req.params;
        const documents = req.body;
        
        // Validate collection name and data
        if (!collectionName) {
            return res.status(400).json({ error: 'Collection name is required' });
        }
        
        if (!Array.isArray(documents)) {
            return res.status(400).json({ error: 'Request body must be an array of documents' });
        }
        
        // Get the collection
        const collection = mongoose.connection.db.collection(collectionName);
        
        // Clear existing data
        await collection.deleteMany({});
        
        // Insert new documents if any
        let result = { insertedCount: 0 };
        if (documents.length > 0) {
            // Preserve _id if it exists, otherwise let MongoDB generate it
            const docsToInsert = documents.map(doc => {
                if (doc._id) {
                    // Convert string _id to ObjectId if needed
                    try {
                        if (typeof doc._id === 'string') {
                            return { ...doc, _id: new mongoose.Types.ObjectId(doc._id) };
                        }
                    } catch (err) {
                        // If _id is not a valid ObjectId, remove it and let MongoDB generate
                        const { _id, ...rest } = doc;
                        return rest;
                    }
                }
                return doc;
            });
            
            result = await collection.insertMany(docsToInsert);
        }
        
        res.json({
            success: true,
            message: `Successfully saved ${result.insertedCount} documents to ${collectionName}`,
            insertedCount: result.insertedCount
        });
    } catch (error) {
        console.error('Error saving backup collection:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Clear all documents from a specific collection
 * DELETE /api/notes/backup/:collectionName or /api/videos/backup/:collectionName
 */
exports.clearBackupCollection = async (req, res) => {
    try {
        const { collectionName } = req.params;
        
        // Validate collection name
        if (!collectionName) {
            return res.status(400).json({ error: 'Collection name is required' });
        }
        
        // Get the collection
        const collection = mongoose.connection.db.collection(collectionName);
        
        // Delete all documents
        const result = await collection.deleteMany({});
        
        res.json({
            success: true,
            message: `Successfully cleared ${collectionName}`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing backup collection:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Copy data from one collection to another
 * POST /api/backup/copy
 * Body: { sourceCollection, targetCollection }
 */
exports.copyCollection = async (req, res) => {
    try {
        const { sourceCollection, targetCollection } = req.body;
        
        // Validate collection names
        if (!sourceCollection || !targetCollection) {
            return res.status(400).json({ error: 'Source and target collection names are required' });
        }
        
        // Get collections
        const source = mongoose.connection.db.collection(sourceCollection);
        const target = mongoose.connection.db.collection(targetCollection);
        
        // Fetch all documents from source
        const documents = await source.find({}).toArray();
        
        if (documents.length === 0) {
            return res.json({
                success: true,
                message: 'No documents to copy',
                copiedCount: 0
            });
        }
        
        // Clear target collection
        await target.deleteMany({});
        
        // Remove _id to let MongoDB generate new ones
        const docsToInsert = documents.map(doc => {
            const { _id, ...rest } = doc;
            return rest;
        });
        
        // Insert into target
        const result = await target.insertMany(docsToInsert);
        
        res.json({
            success: true,
            message: `Successfully copied ${result.insertedCount} documents from ${sourceCollection} to ${targetCollection}`,
            copiedCount: result.insertedCount
        });
    } catch (error) {
        console.error('Error copying collection:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get collection statistics
 * GET /api/backup/stats/:collectionName
 */
exports.getCollectionStats = async (req, res) => {
    try {
        const { collectionName } = req.params;
        
        if (!collectionName) {
            return res.status(400).json({ error: 'Collection name is required' });
        }
        
        const collection = mongoose.connection.db.collection(collectionName);
        
        // Get count and sample document
        const count = await collection.countDocuments();
        const sample = await collection.findOne({});
        
        res.json({
            collectionName,
            documentCount: count,
            exists: count > 0,
            sampleDocument: sample
        });
    } catch (error) {
        console.error('Error getting collection stats:', error);
        res.status(500).json({ error: error.message });
    }
};
