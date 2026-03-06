const express = require('express');
const router = express.Router();
const AnalyticsEvent = require('../models/AnalyticsEvent');

// POST /api/analytics/track - Record an event
router.post('/track', async (req, res) => {
    try {
        const { type, brand, page, productId, productName, productSku, sessionId, referrer } = req.body;

        if (!type) {
            return res.status(400).json({ error: 'type is required' });
        }

        const event = new AnalyticsEvent({
            type,
            brand: brand || '',
            page: page || '',
            productId,
            productName,
            productSku,
            sessionId: sessionId || '',
            referrer: referrer || req.get('referer') || '',
            userAgent: req.get('user-agent') || '',
            ip: req.ip || req.connection?.remoteAddress || ''
        });

        await event.save();
        res.status(201).json({ ok: true });
    } catch (error) {
        console.error('Track event error:', error);
        res.status(500).json({ error: 'Event kaydedilemedi' });
    }
});

// GET /api/analytics/summary - Summary stats
router.get('/summary', async (req, res) => {
    try {
        const { brand, days = 30 } = req.query;
        const since = new Date();
        since.setDate(since.getDate() - parseInt(days));

        const match = { createdAt: { $gte: since } };
        if (brand) match.brand = brand;

        // Total page views
        const totalViews = await AnalyticsEvent.countDocuments({ ...match, type: 'page_view' });

        // Unique visitors (unique sessionIds)
        const uniqueSessions = await AnalyticsEvent.distinct('sessionId', { ...match, sessionId: { $ne: '' } });
        const totalVisitors = uniqueSessions.length;

        // Product views
        const totalProductViews = await AnalyticsEvent.countDocuments({ ...match, type: 'product_view' });

        // WhatsApp clicks
        const whatsappClicks = await AnalyticsEvent.countDocuments({ ...match, type: 'whatsapp_click' });

        // Brand selections
        const brandSelections = await AnalyticsEvent.countDocuments({ ...match, type: 'brand_select' });

        // PDF exports
        const pdfExports = await AnalyticsEvent.countDocuments({ ...match, type: 'catalog_pdf' });

        // Previous period for comparison
        const prevStart = new Date(since);
        prevStart.setDate(prevStart.getDate() - parseInt(days));
        const prevMatch = { createdAt: { $gte: prevStart, $lt: since } };
        if (brand) prevMatch.brand = brand;

        const prevViews = await AnalyticsEvent.countDocuments({ ...prevMatch, type: 'page_view' });
        const prevVisitorSessions = await AnalyticsEvent.distinct('sessionId', { ...prevMatch, sessionId: { $ne: '' } });
        const prevProductViews = await AnalyticsEvent.countDocuments({ ...prevMatch, type: 'product_view' });
        const prevWhatsapp = await AnalyticsEvent.countDocuments({ ...prevMatch, type: 'whatsapp_click' });

        const calcTrend = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

        res.json({
            totalViews,
            totalVisitors,
            totalProductViews,
            whatsappClicks,
            brandSelections,
            pdfExports,
            trends: {
                views: calcTrend(totalViews, prevViews),
                visitors: calcTrend(totalVisitors, prevVisitorSessions.length),
                productViews: calcTrend(totalProductViews, prevProductViews),
                whatsapp: calcTrend(whatsappClicks, prevWhatsapp)
            }
        });
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ error: 'Analytics yuklenemedi' });
    }
});

// GET /api/analytics/daily - Daily views chart
router.get('/daily', async (req, res) => {
    try {
        const { brand, days = 14 } = req.query;
        const since = new Date();
        since.setDate(since.getDate() - parseInt(days));

        const match = { createdAt: { $gte: since }, type: 'page_view' };
        if (brand) match.brand = brand;

        const daily = await AnalyticsEvent.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    views: { $sum: 1 },
                    uniqueSessions: { $addToSet: '$sessionId' }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    views: 1,
                    visitors: { $size: '$uniqueSessions' }
                }
            }
        ]);

        // Fill in missing days with 0
        const result = [];
        const d = new Date(since);
        const now = new Date();
        while (d <= now) {
            const dateStr = d.toISOString().split('T')[0];
            const found = daily.find(item => item.date === dateStr);
            result.push({
                date: dateStr,
                views: found?.views || 0,
                visitors: found?.visitors || 0
            });
            d.setDate(d.getDate() + 1);
        }

        res.json(result);
    } catch (error) {
        console.error('Daily analytics error:', error);
        res.status(500).json({ error: 'Gunluk veriler yuklenemedi' });
    }
});

// GET /api/analytics/products - Top viewed products
router.get('/products', async (req, res) => {
    try {
        const { brand, days = 30, limit = 10 } = req.query;
        const since = new Date();
        since.setDate(since.getDate() - parseInt(days));

        const match = { createdAt: { $gte: since }, type: 'product_view' };
        if (brand) match.brand = brand;

        // Current period
        const topProducts = await AnalyticsEvent.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$productId',
                    name: { $first: '$productName' },
                    sku: { $first: '$productSku' },
                    views: { $sum: 1 }
                }
            },
            { $sort: { views: -1 } },
            { $limit: parseInt(limit) }
        ]);

        // Previous period for trend
        const prevStart = new Date(since);
        prevStart.setDate(prevStart.getDate() - parseInt(days));
        const prevMatch = { createdAt: { $gte: prevStart, $lt: since }, type: 'product_view' };
        if (brand) prevMatch.brand = brand;

        const prevProducts = await AnalyticsEvent.aggregate([
            { $match: prevMatch },
            {
                $group: {
                    _id: '$productId',
                    views: { $sum: 1 }
                }
            }
        ]);

        const prevMap = {};
        prevProducts.forEach(p => { prevMap[p._id] = p.views; });

        const result = topProducts.map(p => ({
            productId: p._id,
            name: p.name || 'Bilinmeyen',
            sku: p.sku || '',
            views: p.views,
            trend: prevMap[p._id]
                ? Math.round(((p.views - prevMap[p._id]) / prevMap[p._id]) * 100)
                : (p.views > 0 ? 100 : 0)
        }));

        res.json(result);
    } catch (error) {
        console.error('Product analytics error:', error);
        res.status(500).json({ error: 'Urun analizleri yuklenemedi' });
    }
});

// GET /api/analytics/events - Event type breakdown
router.get('/events', async (req, res) => {
    try {
        const { brand, days = 30 } = req.query;
        const since = new Date();
        since.setDate(since.getDate() - parseInt(days));

        const match = { createdAt: { $gte: since } };
        if (brand) match.brand = brand;

        const breakdown = await AnalyticsEvent.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json(breakdown.map(b => ({ type: b._id, count: b.count })));
    } catch (error) {
        console.error('Event breakdown error:', error);
        res.status(500).json({ error: 'Event verileri yuklenemedi' });
    }
});

// GET /api/analytics/pages - Top pages
router.get('/pages', async (req, res) => {
    try {
        const { brand, days = 30 } = req.query;
        const since = new Date();
        since.setDate(since.getDate() - parseInt(days));

        const match = { createdAt: { $gte: since }, type: 'page_view' };
        if (brand) match.brand = brand;

        const pages = await AnalyticsEvent.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$page',
                    views: { $sum: 1 },
                    uniqueSessions: { $addToSet: '$sessionId' }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    page: '$_id',
                    views: 1,
                    visitors: { $size: '$uniqueSessions' }
                }
            }
        ]);

        res.json(pages);
    } catch (error) {
        console.error('Page analytics error:', error);
        res.status(500).json({ error: 'Sayfa analizleri yuklenemedi' });
    }
});

module.exports = router;
