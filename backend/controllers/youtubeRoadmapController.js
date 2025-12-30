const mongoose = require('mongoose');
const { YouTubeRoadmap } = require('../models');

/**
 * YouTube Roadmap Controller
 * Handles all business logic for YouTube Roadmap endpoints
 * Storage: MongoDB (primary) + IndexedDB (browser cache)
 * Supports: Active, Temp, Final collections for backup
 */

class YouTubeRoadmapController {
    
    /**
     * Get YouTube Roadmap Data
     * Priority: MongoDB → Default
     */
    async getRoadmap(req, res) {
        try {
            let data = null;

            // Try MongoDB first
            if (mongoose.connection.readyState === 1) {
                const mongoData = await YouTubeRoadmap.findOne().sort({ createdAt: -1 });
                if (mongoData) {
                    console.log('📦 Loading YouTube Roadmap from MongoDB');
                    data = mongoData.toObject();
                }
            }

            // Default data if nothing found
            if (!data) {
                console.log('⚠️  No data found in MongoDB, returning default structure');
                data = {
                    channelName: "Coding Terminals",
                    channelLogo: "./assets/CT logo.jpg",
                    videoPlaylist: [],
                    upcomingTopic: null
                };
            }

            res.json(data);
        } catch (error) {
            console.error('❌ Error reading YouTube roadmap:', error);
            res.status(500).json({ 
                error: error.message,
                message: 'Failed to load YouTube Roadmap'
            });
        }
    }

    /**
     * Save YouTube Roadmap Data
     * Saves to MongoDB only (IndexedDB is handled by frontend)
     */
    async saveRoadmap(req, res) {
        try {
            const data = req.body;
            const savedLocations = [];
            const errors = [];

            // Save to MongoDB
            if (mongoose.connection.readyState === 1) {
                try {
                    // Delete all old documents first to prevent duplicates
                    await YouTubeRoadmap.deleteMany({});
                    
                    // Create new single document
                    const roadmapData = new YouTubeRoadmap(data);
                    await roadmapData.save();
                    
                    console.log('✅ YouTube Roadmap saved to MongoDB');
                    savedLocations.push('MongoDB');
                } catch (mongoError) {
                    console.error('⚠️  MongoDB save failed:', mongoError.message);
                    errors.push({ location: 'MongoDB', error: mongoError.message });
                }
            } else {
                const error = 'MongoDB not connected';
                console.error('❌', error);
                errors.push({ location: 'MongoDB', error });
            }

            // Check if save was successful
            if (savedLocations.length === 0) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to save to MongoDB',
                    message: 'MongoDB connection issue. Please check your database connection.',
                    errors
                });
            }

            res.json({ 
                success: true,
                message: 'YouTube Roadmap saved successfully!',
                savedTo: savedLocations,
                note: 'Data is also cached in IndexedDB by your browser',
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (error) {
            console.error('❌ Error saving YouTube roadmap:', error);
            res.status(500).json({ 
                success: false,
                error: error.message,
                message: 'Failed to save YouTube Roadmap'
            });
        }
    }

    /**
     * Get roadmap from a specific collection (active/temp/final)
     */
    async getRoadmapFromCollection(req, res) {
        try {
            const { collectionType } = req.params;
            
            const collectionMap = {
                'active': 'codingTerminalsYouTubeRoadmap',
                'temp': 'codingTerminalsYouTubeRoadmapTemp',
                'final': 'codingTerminalsYouTubeRoadmapFinal'
            };

            const collectionName = collectionMap[collectionType];
            if (!collectionName) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid collection type. Use: active, temp, or final'
                });
            }

            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({
                    success: false,
                    error: 'Database not connected'
                });
            }

            const collection = mongoose.connection.collection(collectionName);
            const data = await collection.findOne();

            if (!data) {
                return res.json({
                    channelName: "Coding Terminals",
                    channelLogo: "./assets/CT logo.jpg",
                    videoPlaylist: [],
                    upcomingTopic: null,
                    collectionType
                });
            }

            res.json({ ...data, collectionType });
        } catch (error) {
            console.error('❌ Error reading from collection:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Copy data between collections (Active → Temp, Temp → Final, etc.)
     */
    async copyToCollection(req, res) {
        try {
            const { from, to } = req.body;
            
            const collectionMap = {
                'active': 'codingTerminalsYouTubeRoadmap',
                'temp': 'codingTerminalsYouTubeRoadmapTemp',
                'final': 'codingTerminalsYouTubeRoadmapFinal'
            };

            const fromCollection = collectionMap[from];
            const toCollection = collectionMap[to];

            if (!fromCollection || !toCollection) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid collection type. Use: active, temp, or final'
                });
            }

            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({
                    success: false,
                    error: 'Database not connected'
                });
            }

            const sourceCollection = mongoose.connection.collection(fromCollection);
            const data = await sourceCollection.findOne();

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: `No data found in ${from} collection`
                });
            }

            const backupData = {
                ...data,
                backupInfo: {
                    copiedFrom: from,
                    copiedTo: to,
                    timestamp: new Date().toISOString(),
                    videoCount: data.videoPlaylist?.length || 0
                }
            };

            const destCollection = mongoose.connection.collection(toCollection);
            await destCollection.deleteMany({});
            await destCollection.insertOne(backupData);

            console.log(`✅ Data copied from ${from} to ${to} (${backupData.backupInfo.videoCount} videos)`);

            res.json({
                success: true,
                message: `Data copied from ${from} to ${to} successfully!`,
                videoCount: backupData.backupInfo.videoCount,
                timestamp: backupData.backupInfo.timestamp
            });
        } catch (error) {
            console.error('❌ Error copying data:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get backup status for all collections
     */
    async getBackupStatus(req, res) {
        try {
            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({
                    success: false,
                    error: 'Database not connected'
                });
            }

            const collections = {
                active: 'codingTerminalsYouTubeRoadmap',
                temp: 'codingTerminalsYouTubeRoadmapTemp',
                final: 'codingTerminalsYouTubeRoadmapFinal'
            };

            const status = {};

            for (const [type, collectionName] of Object.entries(collections)) {
                const collection = mongoose.connection.collection(collectionName);
                const data = await collection.findOne();
                
                status[type] = {
                    exists: !!data,
                    videoCount: data?.videoPlaylist?.length || 0,
                    lastUpdated: data?.backupInfo?.timestamp || data?.updatedAt || null,
                    backupInfo: data?.backupInfo || null
                };
            }

            res.json({
                success: true,
                status,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error getting backup status:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Export roadmap with Base64 images
     */
    async exportWithImages(req, res) {
        try {
            const { collectionType = 'active' } = req.query;
            
            const collectionMap = {
                'active': 'codingTerminalsYouTubeRoadmap',
                'temp': 'codingTerminalsYouTubeRoadmapTemp',
                'final': 'codingTerminalsYouTubeRoadmapFinal'
            };

            const collectionName = collectionMap[collectionType];
            if (!collectionName) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid collection type'
                });
            }

            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({
                    success: false,
                    error: 'Database not connected'
                });
            }

            const collection = mongoose.connection.collection(collectionName);
            const data = await collection.findOne();

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'No data found'
                });
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="youtube_roadmap_backup_${collectionType}_${Date.now()}.json"`);
            
            res.json({
                ...data,
                exportInfo: {
                    exportedFrom: collectionType,
                    exportedAt: new Date().toISOString(),
                    videoCount: data.videoPlaylist?.length || 0,
                    includesImages: true
                }
            });
        } catch (error) {
            console.error('❌ Error exporting with images:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Import roadmap with Base64 images to a specific collection
     */
    async importWithImages(req, res) {
        try {
            const { collectionType = 'active' } = req.body;
            const data = req.body.data;

            if (!data || !data.videoPlaylist) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid data format. Must include videoPlaylist array.'
                });
            }

            const collectionMap = {
                'active': 'codingTerminalsYouTubeRoadmap',
                'temp': 'codingTerminalsYouTubeRoadmapTemp',
                'final': 'codingTerminalsYouTubeRoadmapFinal'
            };

            const collectionName = collectionMap[collectionType];
            if (!collectionName) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid collection type'
                });
            }

            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({
                    success: false,
                    error: 'Database not connected'
                });
            }

            const importData = {
                ...data,
                importInfo: {
                    importedAt: new Date().toISOString(),
                    videoCount: data.videoPlaylist.length,
                    importedTo: collectionType
                }
            };

            const collection = mongoose.connection.collection(collectionName);
            await collection.deleteMany({});
            await collection.insertOne(importData);

            console.log(`✅ Data imported to ${collectionType} (${data.videoPlaylist.length} videos)`);

            res.json({
                success: true,
                message: `Data imported to ${collectionType} successfully!`,
                videoCount: data.videoPlaylist.length,
                timestamp: importData.importInfo.importedAt
            });
        } catch (error) {
            console.error('❌ Error importing data:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Clear a specific collection
     */
    async clearCollection(req, res) {
        try {
            const { collectionType } = req.params;
            
            if (collectionType === 'active' && !req.body.confirmed) {
                return res.status(400).json({
                    success: false,
                    error: 'Clearing active collection requires confirmation',
                    requiresConfirmation: true
                });
            }

            const collectionMap = {
                'active': 'codingTerminalsYouTubeRoadmap',
                'temp': 'codingTerminalsYouTubeRoadmapTemp',
                'final': 'codingTerminalsYouTubeRoadmapFinal'
            };

            const collectionName = collectionMap[collectionType];
            if (!collectionName) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid collection type'
                });
            }

            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({
                    success: false,
                    error: 'Database not connected'
                });
            }

            const collection = mongoose.connection.collection(collectionName);
            await collection.deleteMany({});

            console.log(`🗑️ Cleared ${collectionType} collection`);

            res.json({
                success: true,
                message: `${collectionType} collection cleared successfully!`
            });
        } catch (error) {
            console.error('❌ Error clearing collection:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new YouTubeRoadmapController();
