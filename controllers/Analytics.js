import Products from "../models/ProductModel.js";
import Analytics from "../models/AnalyticsModel.js"

export const getWebVistors =  async (req, res) => {
    const currentYear = new Date().getFullYear();

    try {
        const AnalyticsData = await Analytics.findAll({
            where: { year: currentYear },
            attributes: ['month', 'web_visitors']
        });

        if (!AnalyticsData || AnalyticsData.length === 0) {
            return res.status(404).json({ error: "Web analytics data not found for the current year" });
        }

        res.json(AnalyticsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch web analytics data" });
    }
};

export const getTotalClicks = async (req, res) => {
    try {
        const totalClicks = await Products.sum("shopee_click") + await Products.sum("tokopedia_click");

        res.status(200).json({ totalClicks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get total clicks" });
    }
};

export const getTotalShopeeClicks = async (req, res) => {
    try {
        const totalShopeeClicks = await Products.sum("shopee_click");

        res.status(200).json({ totalShopeeClicks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get total Shopee clicks" });
    }
};

export const getTotalTokopediaClicks = async (req, res) => {
    try {
        const totalTokopediaClicks = await Products.sum("tokopedia_click");

        res.status(200).json({ totalTokopediaClicks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get total Tokopedia clicks" });
    }
};

