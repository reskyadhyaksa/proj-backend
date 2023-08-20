import Products from "../models/ProductModel.js";
import { Sequelize } from 'sequelize';
import { Op } from "sequelize";

export const getProducts = async (req, res) => {
    const category = req.query.category;

    try {
        let products;

        if (category) {
            products = await Products.findAll({
                where: {
                    category: category
                },
                attributes: ['uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
            });
        } else {
            products = await Products.findAll({
                attributes: ['uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
            });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
}

export const searchProduct = async (req, res) => {
    const searchQuery = req.query.q.toLowerCase(); 
    
    try {
        const products = await Products.findAll({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('name')),
                'LIKE',
                `%${searchQuery}%`
            ),
            attributes: ['uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        if (products.length === 0) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to perform the search" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            },
            attributes: ['uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
} 

export const getProductBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const productName = slug.replace(/-/g, ' ');
        console.log("Converted Product Name:", productName);

        const product = await Products.findOne({
            where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), productName.toLowerCase()),
            attributes: ['uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        console.log("Retrieved Product:", product);

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

export const createProduct = async (req, res) => {
    const {
        name, category, image, price, description, stock,
        shopee_link, tokopedia_link
    } = req.body;
    
    try {
        await Products.create({
            userId: req.userId,
            name,
            category,
            image,
            price,
            description,
            stock,
            isHot_deal: false,
            shopee_link,
            tokopedia_link,         
            shopee_click: 0,
            tokopedia_click: 0
        });
        
        res.status(201).json({ msg: "Product Created Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to create product" });
    }
};

export const updateProduct = async (req, res) => {
    const {
        name, category, image, price, description, stock,
        isHot_deal, shopee_link, tokopedia_link
    } = req.body;
    
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        });
        
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }
        
        await product.update({
            name,
            category,
            image,
            price,
            description,
            stock,
            isHot_deal,
            shopee_link,
            tokopedia_link
        });
        
        res.status(200).json({ msg: "Product Updated Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        });
        
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }
        
        await product.destroy();
        
        res.status(200).json({ msg: "Product Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
};

export const getProductByPrice = async (req, res) => {
    const { minPrice, maxPrice } = req.query;

    try {
        const products = await Products.findAll({
            where: {
                price: {
                    [Op.between]: [minPrice, maxPrice]
                }
            },
            attributes: ['uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products by price range" });
    }
};

export const getHotDealProducts = async (req, res) => {
    try {
        const hotDealProducts = await Products.findAll({
            where: {
                isHot_deal: true
            },
            attributes: ['uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'shopee_link', 'tokopedia_link']
        });
        if (!hotDealProducts) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.status(200).json(hotDealProducts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch hot deal products" });
    }
};

export const getNewCollectionProducts = async (req, res) => {
    try {
        const newCollectionProducts = await Products.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'shopee_link', 'tokopedia_link']
        });
        if (!newCollectionProducts) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.status(200).json(newCollectionProducts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch new collection products" });
    }
};

export const getMostViewedProducts = async (req, res) => {
    try {
        const mostViewedProducts = await Products.findAll({
            order: [[sequelize.literal('shopee_click + tokopedia_click'), 'DESC']],
            attributes: [
                'uuid', 'name', 'category', 'image', 'price', 'description', 'stock',
                'shopee_link', 'tokopedia_link'
            ]
        });

        res.status(200).json(mostViewedProducts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch most viewed products" });
    }
};


