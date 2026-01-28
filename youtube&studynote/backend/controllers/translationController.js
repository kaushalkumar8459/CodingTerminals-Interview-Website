// File: backend/controllers/translationController.js (simplified version without axios)

// MyMemory translation function using fetch
async function translateWithMyMemory(text, targetLang = 'hi', sourceLang = 'en') {
    try {
        // MyMemory has a 5000 character limit per request
        if (text.length > 5000) {
            throw new Error('Text exceeds MyMemory character limit of 5000');
        }

        const encodedText = encodeURIComponent(text);
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLang}|${targetLang}`;
        
        // Using fetch instead of axios
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TranslationService/1.0)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.responseStatus === 200) {
            return data.responseData.translatedText;
        } else {
            throw new Error(data.responseDetails || 'Translation failed');
        }
    } catch (error) {
        console.error('MyMemory translation error:', error.message);
        throw error;
    }
}

// Translate single text
async function translateText(req, res) {
    try {
        const { text, target = 'hi', source = 'en' } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required for translation'
            });
        }

        // Validate language codes
        if (!['hi', 'en'].includes(target) || !['en', 'hi'].includes(source)) {
            return res.status(400).json({
                success: false,
                message: 'Only English to Hindi translation is supported'
            });
        }

        let translatedText = text;

        try {
            translatedText = await translateWithMyMemory(text, target, source);
        } catch (error) {
            console.warn('MyMemory failed, using fallback:', error.message);
            // Return original text if translation fails
            translatedText = text;
        }

        res.json({
            success: true,
            originalText: text,
            translatedText: translatedText,
            sourceLanguage: source,
            targetLanguage: target
        });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({
            success: false,
            message: 'Translation service error',
            error: error.message
        });
    }
}

// Translate batch of texts
async function translateBatch(req, res) {
    try {
        const { texts, target = 'hi', source = 'en' } = req.body;

        if (!Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Array of texts is required for batch translation'
            });
        }

        // Validate language codes
        if (!['hi', 'en'].includes(target) || !['en', 'hi'].includes(source)) {
            return res.status(400).json({
                success: false,
                message: 'Only English to Hindi translation is supported'
            });
        }

        const translations = [];

        for (const text of texts) {
            try {
                const translated = await translateWithMyMemory(text, target, source);
                translations.push(translated);
            } catch (error) {
                console.warn(`Translation failed for: ${text.substring(0, 50)}...`);
                translations.push(text); // Use original if translation fails
            }
        }

        res.json({
            success: true,
            originalTexts: texts,
            translations: translations,
            targetLanguage: target
        });

    } catch (error) {
        console.error('Batch translation error:', error);
        res.status(500).json({
            success: false,
            message: 'Batch translation service error',
            error: error.message
        });
    }
}

module.exports = {
    translateText,
    translateBatch
};