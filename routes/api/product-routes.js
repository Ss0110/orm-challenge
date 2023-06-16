const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ["id", "category_name"],
        },
        {
          model: Tag,
          attributes: ["id", "tag_name"],
        },
      ],
    });
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Category,
          attributes: ["id", "category_name"],
        },
        {
          model: Tag,
          attributes: ["id", "tag_name"],
        },
      ],
    });
    if (!product) {
      res.status(404).json({ message: "Product was not found by id" });
      return;
    }
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// create new product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (req.body.tagIds && req.body.tagIds.length > 0) {
      const productTags = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTags);
    }
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update product
router.put("/:id", async (req, res) => {
  try {
    const [affectedRows] = await Product.update(req.body, {
      where: { id: req.params.id },
    });
    if (affectedRows === 0) {
      res.status(404).json({ message: "No product found with this id" });
      return;
    }
    const productTags = await ProductTag.findAll({
      where: { product_id: req.params.id },
    });
    const tagIds = productTags.map(({ tag_id }) => tag_id);
    const newTagId = req.body.tagIds
      ? req.body.tagIds.filter((tag_id) => !tagIds.includes(tag_id))
      : [];
    const removeTagId = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);
    await Promise.all([
      ProductTag.destroy({ where: { id: removeTagId } }),
      ProductTag.bulkCreate(
        newTagId.map((tag_id) => ({ product_id: req.params.id, tag_id }))
      ),
    ]);
    res.json({ message: "Product has been updated" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const affectedRows = await Product.destroy({
      where: { id: req.params.id },
    });
    if (affectedRows === 0) {
      res.status(404).json({ message: "Product was not found by id" });

      return;
    }
    res.json({ message: "Product has been deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
