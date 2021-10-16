const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
    const search = "al";
    const products = await Product
    .find({name: {$regex:search, $options:"i"},
           price: {$gt: 300}})
    .sort("name")
    .select("name price");
    res.status(200).json({products});
};

const getAllProducts = async (req, res) => {
    const {featured, company, name, sort, fields, numericFilters} = req.query;
    const queryObject = {};

    if (featured) {
        queryObject.featured = featured === "true"? true: false;
    }
    if (company) {
        queryObject.company = company;
    }
    if (name) {
        queryObject.name = {$regex:name, $options:"i"};
    }
    if (numericFilters){
        const operatorMap = {
            ">": "$gt",
            "<": "$lt",
            ">=": "$gte",
            "<=": "$lte",
            "=": "$eq",
        }
        const regEx = /\b(<|>|>=|<=|=)\b/g;
        let filters = numericFilters.replace(regEx, (match)=>{
        return `-${operatorMap[match]}-`
        });
        const options = ["price", "rating"];
        filters = filters.split(",").forEach((item) => {
        const [field, operator, value] = item.split("-");
            if (options.includes(field)){
                queryObject[field] = {[operator]: Number(value)}
            }
        });
    }
    let results = Product.find(queryObject);
    if (sort) {
        const sortList = sort.split(",").join(" ");
        results = results.sort(sortList);
    } else {
        results = results.sort("createdAt");
    }

    if (fields){
        const fieldList = fields.split(",").join(" ");
        results = results.select(fieldList);
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 1;
    const skip = (page - 1) * limit;
    results = results.skip(skip).limit(limit);

    const products = await results; 
    res.status(200).json({nbHits: products.length, products});
};

module.exports = {getAllProducts, getAllProductsStatic};