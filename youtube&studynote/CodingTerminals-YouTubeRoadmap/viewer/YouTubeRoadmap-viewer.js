// YouTube API Configuration
const YOUTUBE_API_KEY = APP_CONFIG.YOUTUBE.API_KEY;
const PLAYLIST_ID = APP_CONFIG.YOUTUBE.PLAYLIST_ID;

// Global variable to store all video playlist data
let allVideoPlaylistData = [];
let searchTimeout = null; // For debouncing search
let currentSortOrder = APP_CONFIG.APP.DEFAULT_SORT_ORDER; // Default sort order from config

// Helper function to preserve line breaks in text
function preserveLineBreaks(text) {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
}

// Helper function to render HTML content safely
function renderHTMLContent(html) {
    if (!html) return '';
    // If it's already HTML (contains tags), return as is
    // Otherwise, preserve line breaks for backward compatibility
    if (html.includes('<') && html.includes('>')) {
        return html;
    }
    return html.replace(/\n/g, '<br>');
}

// Helper function to convert HTML to plain text
function htmlToPlainText(html) {
    if (!html) return '';
    
    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get the text content (this strips all HTML tags)
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}

// Helper function to convert HTML to Word-friendly format (preserves structure)
function htmlToWordFormat(html) {
    if (!html) return '';
    
    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Replace common HTML tags with Word-compatible formatting
    let wordHtml = html
        // Preserve line breaks
        .replace(/<br\s*\/?>/gi, '<br>')
        // Convert paragraph tags
        .replace(/<p>/gi, '<p style="margin: 10px 0;">')
        // Convert lists
        .replace(/<ul>/gi, '<ul style="margin: 10px 0; padding-left: 20px;">')
        .replace(/<ol>/gi, '<ol style="margin: 10px 0; padding-left: 20px;">')
        .replace(/<li>/gi, '<li style="margin: 5px 0;">')
        // Convert headings
        .replace(/<h1>/gi, '<h1 style="font-size: 24px; font-weight: bold; margin: 15px 0;">')
        .replace(/<h2>/gi, '<h2 style="font-size: 20px; font-weight: bold; margin: 12px 0;">')
        .replace(/<h3>/gi, '<h3 style="font-size: 18px; font-weight: bold; margin: 10px 0;">')
        .replace(/<h4>/gi, '<h4 style="font-size: 16px; font-weight: bold; margin: 8px 0;">')
        // Convert code blocks
        .replace(/<code>/gi, '<code style="background-color: #f4f4f4; padding: 2px 6px; font-family: Consolas, monospace; border-radius: 3px;">')
        .replace(/<pre>/gi, '<pre style="background-color: #f4f4f4; padding: 10px; font-family: Consolas, monospace; border-radius: 5px; overflow-x: auto; white-space: pre-wrap;">')
        // Convert bold and italic
        .replace(/<strong>/gi, '<strong style="font-weight: bold;">')
        .replace(/<b>/gi, '<b style="font-weight: bold;">')
        .replace(/<em>/gi, '<em style="font-style: italic;">')
        .replace(/<i>/gi, '<i style="font-style: italic;">');
    
    return wordHtml;
}

// Fetch playlist videos from YouTube API
async function fetchPlaylistVideos() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch playlist videos');
        }

        const data = await response.json();

        // Sort items by position in reverse order (newest first becomes Day 1)
        const sortedItems = data.items.sort((a, b) => b.snippet.position - a.snippet.position);

        return sortedItems.map((item, index) => ({
            day: index + 1,
            date: item.snippet.publishedAt.split('T')[0],
            title: item.snippet.title,
            videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            videoId: item.snippet.resourceId.videoId,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url
        }));
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return null;
    }
}

// Fetch and display video playlist data
async function loadVideoPlaylist() {
    // Show loader
    GlobalLoader.show('Loading Videos', 'Fetching playlist from server...');
    
    try {
        // Try to fetch from backend API first
        GlobalLoader.updateMessage('Loading Videos', 'Connecting to database...');
        const apiResponse = await fetch(APP_CONFIG.API.BASE_URL + APP_CONFIG.API.ENDPOINTS.YOUTUBE_ROADMAP);
        
        if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            
            // Check if we got data from the API
            if (apiData.success && apiData.data && apiData.data.length > 0) {
                GlobalLoader.updateMessage('Loading Videos', 'Processing video data...');
                
                // Use data from MongoDB - separate published and upcoming videos
                const publishedVideos = [];
                const upcomingVideos = [];
                
                apiData.data.forEach((video, index) => {
                    const videoData = {
                        day: video.day || (index + 1),
                        date: video.isUpcoming ? (video.estimatedDate || new Date().toISOString().split('T')[0]) : (video.date || video.createdAt || new Date().toISOString().split('T')[0]),
                        title: video.title,
                        videoUrl: video.videoUrl || `https://www.youtube.com/watch?v=${video.videoId}`,
                        videoId: video.videoId,
                        description: video.description || '',
                        thumbnail: video.thumbnail || '',
                        subtopics: video.subtopics || ["Watch the video to learn more"],
                        interviewQuestions: video.interviewQuestions || [],
                        isTodaysTopic: video.isUpcoming || false
                    };
                    
                    if (video.isUpcoming) {
                        upcomingVideos.push(videoData);
                    } else {
                        publishedVideos.push(videoData);
                    }
                });
                
                // Combine: published videos first, then upcoming videos
                allVideoPlaylistData = [...publishedVideos, ...upcomingVideos];

                // Display with default channel info
                displayHeader(APP_CONFIG.APP.CHANNEL_NAME, APP_CONFIG.CHANNEL.LOGO);
                displayVideoPlaylist(allVideoPlaylistData);
                updateSearchInfo(allVideoPlaylistData.length, allVideoPlaylistData.length);
                
                // Hide loader after successful load
                GlobalLoader.hide();
                return;
            }
        }

        // Fallback: Try to fetch from YouTube API
        GlobalLoader.updateMessage('Loading Videos', 'Fetching from YouTube API...');
        let playlistVideos = await fetchPlaylistVideos();

        if (playlistVideos && playlistVideos.length > 0) {
            // Load from local JSON to get subtopics if available
            try {
                const jsonResponse = await fetch('/assets/codingTerminalsYouTubeRoadmap.json');
                if (jsonResponse.ok) {
                    const jsonData = await jsonResponse.json();

                    // Merge YouTube data with local subtopics
                    allVideoPlaylistData = playlistVideos.map((video, index) => ({
                        ...video,
                        subtopics: jsonData.videoPlaylist[index]?.subtopics || [
                            "Watch the video to learn more",
                            "Practice exercises included",
                            "Code examples provided"
                        ],
                        interviewQuestions: jsonData.videoPlaylist[index]?.interviewQuestions || []
                    }));

                    // Add "Today's Topic" card from JSON at the end
                    if (jsonData.upcomingTopics && jsonData.upcomingTopics.length > 0) {
                        // Add all upcoming topics
                        jsonData.upcomingTopics.forEach((upcomingTopic, idx) => {
                            const todaysTopic = {
                                day: `Coming Soon ${idx + 1}`,
                                date: upcomingTopic.estimatedDate || new Date().toISOString().split('T')[0],
                                title: upcomingTopic.title,
                                videoUrl: '#',
                                videoId: null,
                                description: upcomingTopic.description || '',
                                subtopics: upcomingTopic.subtopics || [],
                                interviewQuestions: upcomingTopic.interviewQuestions || [],
                                isTodaysTopic: true
                            };
                            allVideoPlaylistData.push(todaysTopic);
                        });
                    } else if (jsonData.upcomingTopic) {
                        // Backward compatibility: support single upcomingTopic
                        const todaysTopic = {
                            day: 'Coming Soon',
                            date: jsonData.upcomingTopic.estimatedDate || new Date().toISOString().split('T')[0],
                            title: jsonData.upcomingTopic.title,
                            videoUrl: '#',
                            videoId: null,
                            description: jsonData.upcomingTopic.description,
                            subtopics: jsonData.upcomingTopic.subtopics,
                            interviewQuestions: jsonData.upcomingTopic.interviewQuestions || [],
                            isTodaysTopic: true
                        };
                        allVideoPlaylistData.push(todaysTopic);
                    }

                    displayHeader(jsonData.channelName, jsonData.channelLogo);
                } else {
                    allVideoPlaylistData = playlistVideos;
                    displayHeader(APP_CONFIG.APP.CHANNEL_NAME, APP_CONFIG.CHANNEL.LOGO);
                }
            } catch (jsonError) {
                console.log('JSON file not available, using YouTube data only');
                allVideoPlaylistData = playlistVideos;
                displayHeader(APP_CONFIG.APP.CHANNEL_NAME, APP_CONFIG.CHANNEL.LOGO);
            }

            displayVideoPlaylist(allVideoPlaylistData);
            updateSearchInfo(allVideoPlaylistData.length, allVideoPlaylistData.length);
            GlobalLoader.hide();
            return;
        }

        // Last resort: Load from local JSON file
        GlobalLoader.updateMessage('Loading Videos', 'Loading from local cache...');
        const localResponse = await fetch('/assets/codingTerminalsYouTubeRoadmap.json');
        if (!localResponse.ok) {
            throw new Error('Failed to load video playlist data from all sources');
        }

        const localData = await localResponse.json();
        allVideoPlaylistData = localData.videoPlaylist || [];

        // Add "Today's Topic" card from JSON
        if (localData.upcomingTopic) {
            const todaysTopic = {
                day: 'Coming Soon',
                date: localData.upcomingTopic.estimatedDate || new Date().toISOString().split('T')[0],
                title: localData.upcomingTopic.title,
                videoUrl: '#',
                videoId: null,
                description: localData.upcomingTopic.description,
                subtopics: localData.upcomingTopic.subtopics,
                interviewQuestions: localData.upcomingTopic.interviewQuestions || [],
                isTodaysTopic: true
            };
            allVideoPlaylistData.push(todaysTopic);
        }

        displayHeader(localData.channelName || APP_CONFIG.APP.CHANNEL_NAME, 
                     localData.channelLogo || APP_CONFIG.CHANNEL.LOGO);
        displayVideoPlaylist(allVideoPlaylistData);
        updateSearchInfo(allVideoPlaylistData.length, allVideoPlaylistData.length);
        
        // Hide loader after successful load
        GlobalLoader.hide();

    } catch (error) {
        console.error('Error loading video playlist:', error);
        GlobalLoader.hide();
        document.getElementById('header').innerHTML = `
            <div class="error">
                <h2>Error Loading Video Playlist</h2>
                <p>${error.message}</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Please check your connection and try again.</p>
            </div>
        `;
    }
}

// Search functionality with debounce
function handleSearch() {
    // Clear the previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Set a new timeout to search after 500ms of no typing
    searchTimeout = setTimeout(() => {
        performSearch();
    }, 500); // Wait 500ms after user stops typing
}

// Perform the actual search
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const container = document.getElementById('roadmapContainer');

    if (searchTerm === '') {
        // Show all videos if search is empty
        container.innerHTML = '';
        displayVideoPlaylist(allVideoPlaylistData);
        updateSearchInfo(allVideoPlaylistData.length, allVideoPlaylistData.length);
        return;
    }

    // Filter through all data: title, description, and subtopics
    const filteredData = allVideoPlaylistData.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = item.description && item.description.toLowerCase().includes(searchTerm);
        const subtopicsMatch = item.subtopics.some(subtopic =>
            subtopic.toLowerCase().includes(searchTerm)
        );

        return titleMatch || descriptionMatch || subtopicsMatch;
    });

    // Update UI based on search results
    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>😕 No results found</h3>
                <p>Try searching with different keywords like "Angular", "JavaScript", "Setup", etc.</p>
            </div>
        `;
        updateSearchInfo(0, allVideoPlaylistData.length);
    } else {
        container.innerHTML = '';
        displayVideoPlaylist(filteredData);
        updateSearchInfo(filteredData.length, allVideoPlaylistData.length);
    }
}

// Update search results information
function updateSearchInfo(found, total) {
    const infoElement = document.getElementById('searchResultsInfo');
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (searchTerm === '') {
        infoElement.textContent = `Showing all ${total} videos`;
    } else {
        infoElement.textContent = `Found ${found} of ${total} videos`;
    }
}

function displayHeader(channelName, channelLogo) {
    const headerElement = document.getElementById('header');
    headerElement.innerHTML = `
        <img src="${channelLogo}" alt="${channelName} Logo" class="logo">
        <div class="channel-info">
            <h1>${channelName}</h1>
            <p>Your Complete Learning Video Playlist</p>
        </div>
    `;
}

function displayVideoPlaylist(playlist) {
    const container = document.getElementById('roadmapContainer');
    container.innerHTML = ''; // Clear all existing cards before displaying new ones

    let upcomingSectionAdded = false;

    playlist.forEach((day, index) => {
        // Add section divider before the first upcoming video
        if (day.isTodaysTopic && !upcomingSectionAdded) {
            const sectionDivider = document.createElement('div');
            sectionDivider.className = 'upcoming-section-divider';
            sectionDivider.innerHTML = `
                <div class="section-divider-content">
                    <span class="divider-line"></span>
                    <span class="divider-label">🔔 UPCOMING VIDEOS</span>
                    <span class="divider-line"></span>
                </div>
            `;
            container.appendChild(sectionDivider);
            upcomingSectionAdded = true;
        }

        const card = document.createElement('div');
        card.className = `day-card ${day.isTodaysTopic ? 'todays-topic-card' : ''}`;
        card.style.animationDelay = `${index * 0.1}s`;

        // Find the original index in allVideoPlaylistData for download functionality
        const originalIndex = allVideoPlaylistData.findIndex(item => 
            item.title === day.title && item.date === day.date
        );

        const subtopicsList = day.subtopics.map(subtopic =>
            `<li>${renderHTMLContent(subtopic)}</li>`
        ).join('');

        // Create interview questions section if available
        const interviewQuestionsSection = day.interviewQuestions && day.interviewQuestions.length > 0 ? `
            <div class="interview-section">
                <div class="interview-header">
                    <h3 class="interview-title">Interview Questions</h3>
                    <div class="download-dropdown">
                        <button class="download-qa-btn" onclick="toggleDownloadMenu(event, ${originalIndex})">
                            📥 Download Q&A
                            <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="download-menu" id="downloadMenu${originalIndex}">
                            <div class="download-option" onclick="downloadQuestionsAndAnswers(${originalIndex}, '${day.title.replace(/'/g, "\\'")}', 'text')">
                                📄 Download as Text (.txt)
                            </div>
                            <div class="download-option" onclick="downloadQuestionsAndAnswers(${originalIndex}, '${day.title.replace(/'/g, "\\'")}', 'word')">
                                📃 Download as Word (.docx)
                            </div>
                        </div>
                    </div>
                </div>
                <ul class="interview-questions-list">
                    ${day.interviewQuestions.map((item, qIndex) => {
            // Check if item is an object with question/answer or just a string
            const question = typeof item === 'object' ? item.question : item;
            const answer = typeof item === 'object' ? item.answer : '';

            return `
                            <li onclick="toggleInterviewAnswer(this)">
                                <div class="interview-question-header">
                                    <span class="interview-question-number">${qIndex + 1}</span>
                                    <span class="interview-question-text">${renderHTMLContent(question)}</span>
                                    ${answer ? '<span class="has-answer-indicator">💡 Click to view answer</span><span class="interview-question-toggle">▼</span>' : ''}
                                </div>
                                ${answer ? `<div class="interview-answer">${renderHTMLContent(answer)}</div>` : ''}
                            </li>
                        `;
        }).join('')}
                </ul>
            </div>
        ` : '';

        // Extract YouTube video ID from URL (skip for Today's Topic card)
        const videoId = extractYouTubeId(day.videoUrl);
        const videoEmbed = videoId ? `
            <div class="video-container">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}" 
                    title="${day.title}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        ` : (day.isTodaysTopic ? `
            <div style="text-align: center; padding: 20px; color: #ff9800;">
                <h2 style="font-size: 3rem; margin: 0;">🎬</h2>
                <p style="margin-top: 10px; font-weight: 600;">Coming Soon!</p>
            </div>
        ` : `
            <div style="text-align: center; padding: 20px; color: #2196f3;">
                <h2 style="font-size: 3rem; margin: 0;">📹</h2>
                <p style="margin-top: 10px; font-weight: 600;">Video will be uploaded soon</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">Content prepared in advance</p>
            </div>
        `);

        const watchButton = day.isTodaysTopic ? `
            <a href="https://www.youtube.com/@codingterminals?sub_confirmation=1" target="_blank" class="video-link">
                🔔 Subscribe for Updates
            </a>
        ` : (videoId ? `
            <a href="${day.videoUrl}" target="_blank" class="video-link">
                📺 Watch on YouTube
            </a>
        ` : `
            <a href="https://www.youtube.com/@codingterminals?sub_confirmation=1" target="_blank" class="video-link">
                🔔 Get Notified When Video is Live
            </a>
        `);

        card.innerHTML = `
            <div class="day-header" onclick="toggleAccordion(this)">
                <div class="day-left">
                    <span class="day-number">${day.isTodaysTopic ? '🔔 ' : 'Day '}${day.day}</span>
                    <h2 class="title">${day.title}</h2>
                </div>
                <div class="day-right">
                    <span class="date">${formatDate(day.date)}</span>
                    <span class="accordion-icon">▼</span>
                </div>
            </div>
            <div class="card-content">
                <div class="content-grid">
                    <div class="subtopics-section">
                        <div class="topics-box">
                            <h3 class="subtopics-title">${day.isTodaysTopic ? 'What to Expect:' : 'Topics Covered:'}</h3>
                            <ul class="subtopics-list">
                                ${subtopicsList}
                            </ul>
                        </div>
                    </div>
                    <div class="video-section">
                        ${videoEmbed}
                        ${watchButton}
                    </div>
                </div>
                ${interviewQuestionsSection}
            </div>
        `;

        container.appendChild(card);
    });
}

function extractYouTubeId(url) {
    // Return null if URL is undefined, null, empty, or a placeholder
    if (!url || url === '#' || url.trim() === '' || url === 'undefined') {
        return null;
    }
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.accordion-icon');

    if (!content || !icon) {
        return; // Safety check
    }

    const isCurrentlyActive = content.classList.contains('active');

    // Only close other accordions if we're opening this one
    if (!isCurrentlyActive) {
        // Use a more efficient approach - only get parent container's children
        const container = header.closest('#roadmapContainer');
        if (container) {
            const activeContents = container.querySelectorAll('.card-content.active');
            activeContents.forEach(item => {
                if (item !== content) {
                    item.classList.remove('active');
                    const prevIcon = item.previousElementSibling?.querySelector('.accordion-icon');
                    if (prevIcon) {
                        prevIcon.classList.remove('active');
                    }
                }
            });
        }
    }

    // Toggle current accordion
    content.classList.toggle('active');
    icon.classList.toggle('active');
}

function toggleInterviewAnswer(questionElement) {
    const answerElement = questionElement.querySelector('.interview-answer');
    const toggleIcon = questionElement.querySelector('.interview-question-toggle');

    if (answerElement) {
        // Find the parent interview section to close only answers within this card
        const parentInterviewSection = questionElement.closest('.interview-section');
        
        // Close all other interview answers within the same card
        if (parentInterviewSection) {
            parentInterviewSection.querySelectorAll('.interview-answer').forEach(answer => {
                if (answer !== answerElement && answer.classList.contains('active')) {
                    answer.classList.remove('active');
                    // Also toggle the icon for the closed answer
                    const closedIcon = answer.parentElement.querySelector('.interview-question-toggle');
                    if (closedIcon) {
                        closedIcon.classList.remove('active');
                    }
                }
            });
        }

        // Toggle current answer
        answerElement.classList.toggle('active');
        if (toggleIcon) {
            toggleIcon.classList.toggle('active');
        }
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Sort videos by day (asc or desc)
function sortVideos(order) {
    currentSortOrder = order;

    // Remove active class from all sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked button
    if (order === 'desc') {
        document.getElementById('sortDesc').classList.add('active');
    } else {
        document.getElementById('sortAsc').classList.add('active');
    }

    // Sort the data
    let sortedData = [...allVideoPlaylistData];
    if (order === 'asc') {
        sortedData.sort((a, b) => a.day - b.day); // Oldest first
    } else {
        sortedData.sort((a, b) => b.day - a.day); // Newest first
    }

    // Re-display with sorted data
    const container = document.getElementById('roadmapContainer');
    container.innerHTML = '';
    displayVideoPlaylist(sortedData);
}

// Download Questions and Answers as Text or Word File
function downloadQuestionsAndAnswers(cardIndex, topicTitle, format) {
    const day = allVideoPlaylistData[cardIndex];

    if (!day.interviewQuestions || day.interviewQuestions.length === 0) {
        alert('No interview questions available for this topic.');
        return;
    }

    if (format === 'text') {
        // Create text content for TXT file
        let textContent = `=====================================\n`;
        textContent += `${topicTitle}\n`;
        textContent += `Interview Questions & Answers\n`;
        textContent += `Date: ${formatDate(day.date)}\n`;
        textContent += `=====================================\n\n`;

        day.interviewQuestions.forEach((item, index) => {
            const question = typeof item === 'object' ? htmlToPlainText(item.question) : htmlToPlainText(item);
            const answer = typeof item === 'object' ? htmlToPlainText(item.answer) : '';

            textContent += `Q${index + 1}. ${question}\n\n`;

            if (answer) {
                textContent += `Answer:\n${answer}\n\n`;
            } else {
                textContent += `Answer: (Not available yet)\n\n`;
            }

            textContent += `-------------------------------------\n\n`;
        });

        textContent += `\n\nGenerated from Coding Terminals Video Playlist\n`;
        textContent += `YouTube: https://www.youtube.com/@codingterminals\n`;

        // Download as text file
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topicTitle.replace(/[^a-z0-9]/gi, '_')}_QA.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } else if (format === 'word') {
        // Create HTML content for Word document
        let htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset='utf-8'>
    <title>${topicTitle} - Interview Q&A</title>
    <style>
        body { 
            font-family: Calibri, Arial, sans-serif; 
            line-height: 1.6; 
            margin: 40px; 
            font-size: 11pt;
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 10px; 
            page-break-after: avoid;
        }
        h2 { 
            color: #34495e; 
            margin-top: 30px; 
            page-break-after: avoid;
        }
        .header { 
            background-color: #ecf0f1; 
            padding: 20px; 
            border-radius: 5px; 
            margin-bottom: 30px; 
        }
        .question { 
            background-color: #e8f5e9; 
            padding: 15px; 
            margin: 20px 0; 
            border-left: 4px solid #4caf50;
            page-break-inside: avoid;
        }
        .answer { 
            background-color: #fff3e0; 
            padding: 15px; 
            margin: 10px 0 20px 20px; 
            border-left: 4px solid #ff9800;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .question-number { 
            font-weight: bold; 
            color: #2196f3; 
            font-size: 1.1em; 
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #bdc3c7; 
            color: #7f8c8d; 
            font-size: 0.9em; 
        }
        p { margin: 10px 0; }
        ul, ol { margin: 10px 0; padding-left: 30px; }
        li { margin: 5px 0; }
        code { 
            background-color: #f4f4f4; 
            padding: 2px 6px; 
            font-family: Consolas, 'Courier New', monospace; 
            border-radius: 3px;
            font-size: 10pt;
        }
        pre { 
            background-color: #f4f4f4; 
            padding: 10px; 
            font-family: Consolas, 'Courier New', monospace; 
            border-radius: 5px; 
            overflow-x: auto; 
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${topicTitle}</h1>
        <p><strong>Interview Questions & Answers</strong></p>
        <p>Date: ${formatDate(day.date)}</p>
    </div>
`;

        day.interviewQuestions.forEach((item, index) => {
            const question = typeof item === 'object' ? item.question : item;
            const answer = typeof item === 'object' ? item.answer : '';

            htmlContent += `
    <div class="question">
        <span class="question-number">Q${index + 1}.</span> ${htmlToWordFormat(question)}
    </div>
`;

            if (answer) {
                htmlContent += `
    <div class="answer">
        <strong>Answer:</strong><br><br>
        ${htmlToWordFormat(answer)}
    </div>
`;
            } else {
                htmlContent += `
    <div class="answer">
        <strong>Answer:</strong> (Not available yet)
    </div>
`;
            }
        });

        htmlContent += `
    <div class="footer">
        <p><strong>Generated from Coding Terminals Video Playlist</strong></p>
        <p>YouTube: <a href="https://www.youtube.com/@codingterminals">https://www.youtube.com/@codingterminals</a></p>
    </div>
</body>
</html>`;

        // Create blob with proper Word HTML format
        const blob = new Blob(['\ufeff', htmlContent], { 
            type: 'application/vnd.ms-word;charset=utf-8' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topicTitle.replace(/[^a-z0-9]/gi, '_')}_QA.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Toggle download menu visibility
function toggleDownloadMenu(event, index) {
    event.stopPropagation();
    const menu = document.getElementById(`downloadMenu${index}`);
    if (menu) {
        menu.classList.toggle('visible');
    }

    // Close other menus
    document.querySelectorAll('.download-menu').forEach(otherMenu => {
        if (otherMenu !== menu) {
            otherMenu.classList.remove('visible');
        }
    });
}

// Close download menu when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.download-menu').forEach(menu => menu.classList.remove('visible'));
});

// Load video playlist on page load
window.addEventListener('DOMContentLoaded', loadVideoPlaylist);
