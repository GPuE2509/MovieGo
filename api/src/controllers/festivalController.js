const festivalService = require("../services/festivalService");
const cloudinary = require("../config/cloudinary");
const { validationResult } = require("express-validator");

class FestivalController {
  async getAllFestivals(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        page = 0,
        pageSize = 10,
        sortField = "title",
        sortOrder = "asc",
        search = "",
      } = req.query;

      const pageNum = Number(page) || 0;
      const sizeNum = Math.min(Math.max(Number(pageSize) || 10, 1), 100);

      const data = await festivalService.getAllFestivals(
        pageNum,
        sizeNum,
        sortField,
        sortOrder,
        search
      );

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createFestival(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const festivalData = { ...req.body };

      // Handle image upload if provided
      if (req.file) {
        const buffer = req.file.buffer;
        const uploadStream = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image", folder: "festivals" },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
            stream.end(buffer);
          });

        try {
          const result = await uploadStream();
          festivalData.image = result.secure_url;
        } catch (err) {
          return res.status(500).json({
            success: false,
            message: "Error uploading image to Cloudinary",
          });
        }
      }

      await festivalService.createFestival(festivalData);

      res.status(201).json({
        success: true,
        status: 201,
        code: 201,
        data: "Festival created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateFestival(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const festivalData = { ...req.body };

      // Support multipart/form-data: if image file is attached, upload and set image url
      if (req.file) {
        const buffer = req.file.buffer;
        const uploadStream = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image", folder: `festivals/${id}` },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
            stream.end(buffer);
          });
        try {
          const result = await uploadStream();
          festivalData.image = result.secure_url;
        } catch (err) {
          return res.status(500).json({
            success: false,
            message: "Error uploading image to Cloudinary",
          });
        }
      }

      await festivalService.updateFestival(id, festivalData);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: "Festival updated successfully",
      });
    } catch (error) {
      if (error.message === "Festival not found") {
        return res.status(404).json({
          success: false,
          message: "Festival not found",
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateImageFestival(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file cannot be empty",
        });
      }

      const { id } = req.params;
      const buffer = req.file.buffer;

      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: `festivals/${id}` },
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
          stream.end(buffer);
        });

      const result = await uploadStream();
      await festivalService.updateImageFestival(id, result.secure_url);

      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        data: {
          image: result.secure_url,
        },
      });
    } catch (error) {
      if (error.message === "Festival not found") {
        return res.status(404).json({
          success: false,
          message: "Festival not found",
        });
      }
      res.status(400).json({
        success: false,
        message: `Failed to upload image: ${error.message}`,
      });
    }
  }

  async deleteFestival(req, res) {
    try {
      const { id } = req.params;
      await festivalService.deleteFestival(id);

      // Use 200 OK so clients like Postman display the response body
      res.status(200).json({
        success: true,
        status: 200,
        code: 200,
        message: "Festival deleted successfully",
      });
    } catch (error) {
      if (error.message === "Festival not found") {
        return res.status(404).json({
          success: false,
          message: "Festival not found",
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getFestivalDetail(req, res) {
    try {
      const { id } = req.params;
      const festival = await festivalService.getFestivalDetail(id);

      if (!festival) {
        return res.status(404).json({
          success: false,
          message: "Festival not found",
        });
      }

      res.status(200).json({
        success: true,
        data: festival,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTopFestivals(req, res) {
    try {
      const { limit = 5 } = req.query;
      const festivals = await festivalService.getTopFestivals(Number(limit));

      res.status(200).json({
        success: true,
        data: festivals,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new FestivalController();
