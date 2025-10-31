const screenManagementService = require("../services/screenManagementService");
const { validationResult } = require("express-validator");

// Helper function to format validation errors
const formatValidationErrors = (errors) => {
  return errors.array().map(({ type, msg, path, location }) => ({
    type,
    msg,
    path,
    location,
  }));
};

class ScreenManagementController {
  async getAllScreens(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "BAD_REQUEST",
          code: 400,
          data: formatValidationErrors(errors),
        });
      }

      const {
        page = 0,
        pageSize = 10,
        sortField = "name",
        sortOrder = "asc",
        search = ""
      } = req.query;
      const result = await screenManagementService.getAllScreens({
        page: Number(page),
        pageSize: Number(pageSize),
        sortField,
        sortOrder,
        search
      });
      res.status(200).json({
        status: "OK",
        code: 200,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        status: "BAD_REQUEST",
        code: 400,
        data: error.message
      });
    }
  }

  async getScreenById(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "BAD_REQUEST",
          code: 400,
          data: formatValidationErrors(errors),
        });
      }
      const { id } = req.params;
      const screen = await screenManagementService.getScreenById(id);
      res.status(200).json({ status: "OK", code: 200, data: screen });
    } catch (error) {
      if (error.message === "Screen not found") {
        return res.status(404).json({
          status: "NOT_FOUND",
          code: 404,
          data: "Screen not found"
        });
      }
      res.status(400).json({
        status: "BAD_REQUEST",
        code: 400,
        data: error.message
      });
    }
  }

  async createScreen(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "BAD_REQUEST",
          code: 400,
          data: formatValidationErrors(errors),
        });
      }
      await screenManagementService.createScreen(req.body);
      res.status(201).json({
        status: "CREATED",
        code: 201,
        data: "Screen created successfully"
      });
    } catch (error) {
      res.status(400).json({
        status: "BAD_REQUEST",
        code: 400,
        data: error.message
      });
    }
  }

  async updateScreen(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "BAD_REQUEST",
          code: 400,
          data: formatValidationErrors(errors),
        });
      }
      await screenManagementService.updateScreen(req.params.id, req.body);
      res.status(200).json({
        status: "OK",
        code: 200,
        data: "Screen updated successfully"
      });
    } catch (error) {
      if (error.message === "Screen not found") {
        return res.status(404).json({
          status: "NOT_FOUND",
          code: 404,
          data: "Screen not found"
        });
      }
      res.status(400).json({
        status: "BAD_REQUEST",
        code: 400,
        data: error.message
      });
    }
  }

  async updateScreenStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "BAD_REQUEST",
          code: 400,
          data: "Validation failed"
        });
      }
      const { id } = req.params;
      const { is_active } = req.body;
      await screenManagementService.updateScreenStatus(id, is_active);
      res.status(200).json({ status: "OK", code: 200, data: "Screen status updated successfully" });
    } catch (error) {
      if (error.message === "Screen not found") {
        return res.status(404).json({
          status: "NOT_FOUND",
          code: 404,
          data: "Screen not found"
        });
      }
      res.status(400).json({
        status: "BAD_REQUEST",
        code: 400,
        data: error.message
      });
    }
  }

  async deleteScreen(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "BAD_REQUEST",
          code: 400,
          data: formatValidationErrors(errors),
        });
      }
      await screenManagementService.deleteScreen(req.params.id);
      res.status(204).json({
        status: "NO_CONTENT",
        code: 204,
        data: "Screen deleted successfully"
      });
    } catch (error) {
      if (error.message === "Screen not found") {
        return res.status(404).json({
          status: "NOT_FOUND",
          code: 404,
          data: "Screen not found"
        });
      }
      res.status(400).json({
        status: "BAD_REQUEST",
        code: 400,
        data: error.message
      });
    }
  }

  async getScreenByTheaterId(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "BAD_REQUEST",
          code: 400,
          data: formatValidationErrors(errors),
        });
      }
      const { id } = req.params;
      const screens = await screenManagementService.getScreenByTheaterId(id);
      res.status(200).json({
        status: "OK",
        code: 200,
        data: screens
      });
    } catch (error) {
      res.status(404).json({
        status: "NOT_FOUND",
        code: 404,
        data: error.message
      });
    }
  }

  async suggestColumns(req, res) {
    try {
      const { seatCapacity, maxRows } = req.query;
      const data = await screenManagementService.suggestMaxColumns(Number(seatCapacity), Number(maxRows));
      res.status(200).json({ status: "OK", code: 200, data });
    } catch (error) {
      res.status(400).json({ status: "BAD_REQUEST", code: 400, data: error.message });
    }
  }

  async suggestRows(req, res) {
    try {
      const { seatCapacity, maxColumns } = req.query;
      const data = await screenManagementService.suggestMaxRows(Number(seatCapacity), Number(maxColumns));
      res.status(200).json({ status: "OK", code: 200, data });
    } catch (error) {
      res.status(400).json({ status: "BAD_REQUEST", code: 400, data: error.message });
    }
  }
}

module.exports = new ScreenManagementController();


