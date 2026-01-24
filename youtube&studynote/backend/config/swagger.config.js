/**
 * Swagger Configuration
 * API documentation for CodingTerminals Backend
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CodingTerminals Backend API',
            version: '1.0.0',
            description: 'API documentation for CodingTerminals YouTube Roadmap and Study Notes platform',
            contact: {
                name: 'Coding Terminals',
                url: 'https://www.youtube.com/@codingterminals',
                email: 'support@codingterminals.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://staging-api.render.com',
                description: 'Staging server'
            },
            {
                url: 'https://your-production-domain.com',
                description: 'Production server'
            }
        ],
        components: {
            schemas: {
                Video: {
                    type: 'object',
                    required: ['videoId', 'title', 'description'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'MongoDB ObjectId'
                        },
                        videoId: {
                            type: 'string',
                            description: 'YouTube video ID'
                        },
                        title: {
                            type: 'string',
                            description: 'Video title'
                        },
                        description: {
                            type: 'string',
                            description: 'Video description'
                        },
                        playlistId: {
                            type: 'string',
                            description: 'YouTube playlist ID'
                        },
                        thumbnail: {
                            type: 'string',
                            description: 'Thumbnail URL'
                        },
                        duration: {
                            type: 'string',
                            description: 'Video duration'
                        },
                        publishedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Publication date'
                        },
                        views: {
                            type: 'number',
                            description: 'View count'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Note: {
                    type: 'object',
                    required: ['title', 'content'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'MongoDB ObjectId'
                        },
                        title: {
                            type: 'string',
                            description: 'Note title'
                        },
                        content: {
                            type: 'string',
                            description: 'Note content (HTML or Markdown)'
                        },
                        category: {
                            type: 'string',
                            description: 'Note category'
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Tags for note'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                InterviewQuestion: {
                    type: 'object',
                    required: ['question', 'videoId'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'MongoDB ObjectId'
                        },
                        question: {
                            type: 'string',
                            description: 'Interview question'
                        },
                        answer: {
                            type: 'string',
                            description: 'Answer to the question'
                        },
                        videoId: {
                            type: 'string',
                            description: 'Related video ID'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Difficulty level'
                        },
                        category: {
                            type: 'string',
                            description: 'Question category'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        },
                        message: {
                            type: 'string',
                            description: 'Detailed error message'
                        },
                        status: {
                            type: 'number',
                            description: 'HTTP status code'
                        }
                    }
                },
                HealthCheck: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            description: 'Server status'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Response timestamp'
                        },
                        uptime: {
                            type: 'number',
                            description: 'Server uptime in seconds'
                        }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './routes/videoRoutes.js',
        './routes/noteRoutes.js',
        './routes/interviewQuestion.routes.js',
        './routes/authRoutes.js'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
