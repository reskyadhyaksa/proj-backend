import Products from "../models/ProductModel.js";
import { Sequelize } from 'sequelize';
import { Op } from "sequelize";
import fs from "fs";

export const getProducts = async (req, res) => {
    const category = req.query.category;
    
    try {
        let products;

        if (category) {
            products = await Products.findAll({
                where: {
                    category: category.replace(/%/g, ' ')
                },
                attributes: ['id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
            });
        } else {
            products = await Products.findAll({
                attributes: ['id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
            });
        }
        const response = products.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        console.log(response); 
        res.status(200).json(response);
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
            attributes: ['id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        if (products.length === 0) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const response = products.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to perform the search" });
    }
};

export const getProductById = async (req, res) => {
    const productUuid = req.params.id;
    try {
        const product = await Products.findOne({
            where: {
                uuid: productUuid
            },
            attributes: ['id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const response = {
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};


export const getProductBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const productName = slug.replace(/-/g, ' ');

        const product = await Products.findOne({
            where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), productName.toLowerCase()),
            attributes: ['id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        await product.increment('count_view');

        const response = {
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        };

        console.log(response); 
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

export const createProduct = async (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ msg: req.fileValidationError.message });
    }

    const {
        name, category, price, description, stock,
        isHot_deal, shopee_link, tokopedia_link
    } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: "No Image Uploaded" });
    }

    const uploadedImages = req.files.map(file => {
        const fileName = file.filename;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
        return url;
    });

    try {
        const existingProduct = await Products.findOne({
            where: {
                name: name
            }
        });

        if (existingProduct) {
            return res.status(400).json({ msg: "Product with the same name already exists" });
        }

        const imageUrlString = uploadedImages.join(',');

        await Products.create({
            userId: req.userId,
            name,
            category,
            image: imageUrlString,
            price,
            description,
            stock,
            isHot_deal,
            shopee_link,
            tokopedia_link,
            count_view: 0,
            shopee_click: 0,
            tokopedia_click: 0
        });

        res.status(201).json({ msg: "Product Created Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const productUuid = req.params.id;

    const {
        name, category, price, description, stock,
        isHot_deal, shopee_link, tokopedia_link
    } = req.body;

    try {
        const product = await Products.findOne({
            where: {
                uuid: productUuid
            }
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        let updatedImage = "";
        if(req.files === null){
            updatedImage = product.image;
        } else {
            const imageUrls = product.image.split(',');
            const imageFileNames = imageUrls.map(imageUrl => {
                const urlParts = imageUrl.split('/');
                return urlParts[urlParts.length - 1];
            });

            imageFileNames.forEach(imageFileName => {
                const imagePath = `./public/images/${imageFileName}`;
                fs.unlinkSync(imagePath);
            });

            updatedImage = req.files.map(file => {
                const fileName = file.filename;
                const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
                return url;
            });
        }

        const imageUrlString = updatedImage.join(',');
        
        await product.update({
            name,
            category,
            image: imageUrlString,
            price,
            description,
            stock,
            isHot_deal,
            shopee_link,
            tokopedia_link
        });

        res.status(200).json({ msg: "Product Updated Successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    const productUuid = req.params.id;

    try {
        const product = await Products.findOne({
            where: {
                uuid: productUuid
            }
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const imageUrls = product.image.split(',');
        const imageFileNames = imageUrls.map(imageUrl => {
            const urlParts = imageUrl.split('/');
            return urlParts[urlParts.length - 1];
        });

        imageFileNames.forEach(imageFileName => {
            const imagePath = `./public/images/${imageFileName}`;
            fs.unlinkSync(imagePath);
        });

        await product.destroy();

        res.status(200).json({ msg: "Product Deleted Successfully" });
    } catch (error) {
        console.error(error);
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
            attributes: ['id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        const response = products.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products by price range" });
    }
};

export const getBestSellerProducts = async (req, res) => {
    try {
        const bestSellerProducts = await Products.findAll({
            order: [[Sequelize.literal('shopee_click + tokopedia_click'), 'DESC']],
            limit: 5,
            attributes: [
                'id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock',
                'shopee_link', 'tokopedia_link', 'shopee_click', 'tokopedia_click'
            ]
        });

        const response = bestSellerProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch best-selling products" });
    }
};


export const getHotDealProducts = async (req, res) => {
    try {
        const hotDealProducts = await Products.findAll({
            where: {
                isHot_deal: true
            },
            attributes: ['id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'isHot_deal', 'shopee_link', 'tokopedia_link']
        });

        if (!hotDealProducts || hotDealProducts.length === 0) {
            return res.status(404).json({ msg: "Hot deal products not found" });
        }

        const response = hotDealProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch hot deal products" });
    }
};

export const getNewCollectionProducts = async (req, res) => {
    try {
        const newCollectionProducts = await Products.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'shopee_link', 'tokopedia_link', 'createdAt', 'updatedAt']
        });
        if (!newCollectionProducts) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const response = newCollectionProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch new collection products" });
    }
};

export const getMostViewedProducts = async (req, res) => {
    try {
        const mostViewedProducts = await Products.findAll({
            order: [['count_view', 'DESC']],
            limit: 5,
            attributes: [
                'id', 'uuid', 'name', 'category', 'image', 'price', 'description', 'stock', 'count_view',
                'shopee_link', 'tokopedia_link'
            ]
        });

        const response = mostViewedProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch most viewed products" });
    }
};


export const incrShopeeClick = async (req, res) => {
    const productUuid = req.params.id;

    try {
        const product = await Products.findOne({
            where: {
                uuid: productUuid
            }
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await product.increment("shopee_click");

        res.status(200).json({ message: "Shopee click incremented" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to increment shopee click" });
    }
};

export const incrTokopediaClick = async (req, res) => {
    const productUuid = req.params.id;

    try {
        const product = await Products.findOne({
            where: {
                uuid: productUuid
            }
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await product.increment("tokopedia_click");

        res.status(200).json({ message: "Tokopedia click incremented" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to increment tokopedia click" });
    }
};
