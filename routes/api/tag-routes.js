const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

// get all tags
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [
        {
          model: Product,
          attributes: ["id", "product_name", "price", "stock", "category_id"],
        },
      ],
    });
    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one tag
router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Product,
          attributes: ["id", "product_name", "price", "stock", "category_id"],
        },
      ],
    });
    if (!tag) {
      res.status(404).json({ message: "No tag found with this id" });
      return;
    }
    res.json(tag);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// create new tag
router.post("/", async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update tag
router.put("/:id", async (req, res) => {
  try {
    const [rowsAffected] = await Tag.update(req.body, {
      where: { id: req.params.id },
    });
    if (rowsAffected === 0) {
      res.status(404).json({ message: "No tag found with this id" });
      return;
    }
    res.json({ message: "Tag updated" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// delete tag
router.delete("/:id", async (req, res) => {
  try {
    const rowsAffected = await Tag.destroy({
      where: { id: req.params.id },
    });
    if (rowsAffected === 0) {
      res.status(404).json({ message: "No tag found with this id" });
      return;
    }
    res.json({ message: "Tag deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
