import slugify from "slugify";
import crypto from "crypto";

export const generateUniqueSlug = async (Model, name) => {
  // Create base slug
  let baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;

  // Check if slug already exists
  let existing = await Model.findOne({ slug });

  // Keep generating until unique
  while (existing) {
    const random = crypto.randomBytes(3).toString("hex"); // e.g. a1b2c3
    slug = `${baseSlug}-${random}`;

    existing = await Model.findOne({ slug });
  }

  return slug;
};