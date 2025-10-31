const mongoose = require("mongoose");
const Screen = require("../models/screen");
const Theater = require("../models/theater");
const Seat = require("../models/seat");
const ShowTime = require("../models/showtime");

// Helper to map screen model to DTO, ensuring consistency with Java backend response
const toScreenDTO = (screen) => {
  if (!screen) return null;
  const screenObj = screen.toObject ? screen.toObject() : screen;
  return {
    id: screenObj._id,
    name: screenObj.name,
    theaterId: screenObj.theaterId,
    seatCapacity: screenObj.seatCapacity,
    maxRows: screenObj.maxRows,
    maxColumns: screenObj.maxColumns,
    createdAt: screenObj.createdAt,
    updatedAt: screenObj.updatedAt,
  };
};

// Create default seat layout utility (mimicking Java's strategy)
function generateDefaultSeatLayout({ seatCapacity, maxRows, maxColumns }) {
  if (!seatCapacity || !maxRows || !maxColumns) return [];
  const result = [];
  let seatsMade = 0;
  for (let rowNum = 1; rowNum <= maxRows && seatsMade < seatCapacity; rowNum++) {
    const rowLetter = String.fromCharCode("A".charCodeAt(0) + rowNum - 1);
    for (let col = 1; col <= maxColumns && seatsMade < seatCapacity; col++) {
      // Central aisle and even seat per row logic can be introduced here (customize as needed)
      result.push({
        seatNumber: rowLetter + col,
        row: rowLetter,
        column: col,
        isVariable: false,
        type: "STANDARD",
      });
      seatsMade++;
    }
  }
  return result;
}

class ScreenManagementService {
  async getAllScreens({ page = 0, pageSize = 10, sortField = "name", sortOrder = "asc", search = "" }) {
    try {
      const filter = {};
      if (search && search.trim() !== "") {
        filter.name = { $regex: search, $options: "i" };
      }

      const sort = {};
      sort[sortField] = sortOrder === "asc" ? 1 : -1;

      const skip = page * pageSize;
      const limit = pageSize;

      const totalElements = await Screen.countDocuments(filter);
      const content = await Screen.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Structure the response to match Java's PageResponse
      return {
        content: content.map(toScreenDTO),
        totalElements,
        totalPages: Math.ceil(totalElements / pageSize) || 0,
        size: pageSize,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(totalElements / pageSize) - 1,
        hasNext: page < Math.ceil(totalElements / pageSize) - 1,
        hasPrevious: page > 0,
        numberOfElements: content.length,
      };
    } catch (error) {
      throw new Error(`Failed to get screens: ${error.message}`);
    }
  }

  async getScreenById(id) {
    try {
      const screen = await Screen.findById(id);
      if (!screen) {
        throw new Error("Screen not found");
      }
      return toScreenDTO(screen);
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new Error("Screen not found");
      }
      throw new Error(error.message);
    }
  }

  async getScreenByTheaterId(theaterId) {
    try {
      const theater = await Theater.findById(theaterId);
      if (!theater) {
        throw new Error("Theater not found");
      }
      const screens = await Screen.find({ theaterId: theaterId });
      return screens.map(toScreenDTO);
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new Error("Theater not found");
      }
      throw new Error(error.message);
    }
  }

  async createScreen(data) {
    try {
      const { name, theaterId, seatCapacity, maxRows, maxColumns, seatLayout } = data;

      if (!mongoose.Types.ObjectId.isValid(theaterId)) {
        throw new Error("Invalid theater ID");
      }
      const theater = await Theater.findById(theaterId);
      if (!theater) {
        throw new Error("Theater not found");
      }
      const existingScreen = await Screen.findOne({ name, theaterId });
      if (existingScreen) {
        throw new Error(`Screen with name '${name}' already exists in this theater.`);
      }
      // Create screen with seatCapacity from request (like Java backend)
      const newScreen = new Screen({
        name, theaterId, seatCapacity, maxRows, maxColumns });
      await newScreen.save();

      // Step 1: Determine layout (supplied or default)
      let layout = seatLayout;
      if (!Array.isArray(layout) || layout.length === 0) {
        layout = generateDefaultSeatLayout({ seatCapacity, maxRows, maxColumns });
      }
      // Step 2: Even seats per row validation
      const seatsPerRow = {};
      for (const seat of layout) {
        if (seat.row) {
          const r = seat.row.toUpperCase();
          seatsPerRow[r] = (seatsPerRow[r] || 0) + 1;
        }
      }
      for (const [row, count] of Object.entries(seatsPerRow)) {
        if (count % 2 !== 0) {
          throw new Error(`Row ${row} has an odd number of seats: ${count}`);
        }
      }
      // Step 3: Insert seats (BE logic: validate limits and uniqueness, break at seatCapacity)
      let inserted = 0;
      const existingSeatNumbers = new Set();
      for (const seat of layout) {
        if (inserted >= seatCapacity) break;
        const seatNumber = seat.seatNumber;
        const rowLetter = seat.row ? seat.row.toUpperCase() : undefined;
        const rowNumber = rowLetter ? rowLetter.charCodeAt(0) - "A".charCodeAt(0) + 1 : undefined;
        if (!rowLetter || typeof seat.column !== "number") continue; // skip invalid
        // Range check
        if (rowNumber < 1 || rowNumber > maxRows) {
          throw new Error(`Row is out of range for this screen. Max rows: ${maxRows}`);
        }
        if (seat.column < 1 || seat.column > maxColumns) {
          throw new Error(`Column is out of range for this screen. Max columns: ${maxColumns}`);
        }
        // Uniqueness in supplied layout
        const key = rowLetter + ":" + seat.column;
        if (existingSeatNumbers.has(key)) continue;
        existingSeatNumbers.add(key);
        try {
          await Seat.create({
            screen_id: newScreen._id,
            seat_number: seatNumber,
            row: rowLetter,
            column: seat.column,
            is_variable: !!seat.isVariable,
            type: seat.type && ["STANDARD", "VIP", "SWEETBOX"].includes(seat.type) ? seat.type : "STANDARD",
            is_deleted: false,
          });
          inserted++;
        } catch (error) {
          // unique index at DB layer: skip/ignore duplicate
        }
      }
      // Only update seatCapacity if inserted seats are valid (>= 50), otherwise keep original value from request
      if (inserted >= 50) {
        newScreen.seatCapacity = inserted;
      }
      await newScreen.save();
      return toScreenDTO(newScreen);
    } catch (error) {
      throw new Error(`Failed to create screen: ${error.message}`);
    }
  }

  async updateScreen(id, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Screen not found");
      }
      const screen = await Screen.findById(id);
      if (!screen) {
        throw new Error("Screen not found");
      }
      // Duplicate name logic
      if (updateData.name || updateData.theaterId) {
        const targetName = updateData.name || screen.name;
        const targetTheaterId = updateData.theaterId || screen.theaterId;
        const existingScreen = await Screen.findOne({
          name: targetName,
          theaterId: targetTheaterId,
          _id: { $ne: id },
        });
        if (existingScreen) {
          throw new Error(`Screen with name '${targetName}' already exists in this theater.`);
        }
      }
      // Update fields
      const { theaterId, seatLayout, ...simpleUpdates } = updateData;
      if (theaterId) {
        if (!mongoose.Types.ObjectId.isValid(theaterId)) {
          throw new Error("Invalid theater ID");
        }
        const theater = await Theater.findById(theaterId);
        if (!theater) {
          throw new Error("Theater not found");
        }
        screen.theaterId = theaterId;
      }
      Object.assign(screen, simpleUpdates);
      // Update or add seats if new seatLayout is provided
      let updateLayout = seatLayout;
      if (updateLayout && Array.isArray(updateLayout) && updateLayout.length > 0) {
        // Remove all old seats for this screen (soft delete)
        await Seat.updateMany(
          { screen_id: screen._id },
          { is_deleted: true }
        );
        // Insert new provided seats (skip duplicates via unique index)
        let inserted = 0;
        for (const seat of updateLayout) {
          try {
            await Seat.create({
              screen_id: screen._id,
              seat_number: seat.seatNumber,
              row: seat.row,
              column: seat.column,
              is_variable: !!seat.isVariable,
              type: seat.type && ["STANDARD", "VIP", "SWEETBOX"].includes(seat.type) ? seat.type : "STANDARD",
              is_deleted: false,
            });
            inserted++;
          } catch (error) {}
        }
        screen.seatCapacity = inserted;
      }
      await screen.save();
      return toScreenDTO(screen);
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new Error("Screen not found");
      }
      throw new Error(`Failed to update screen: ${error.message}`);
    }
  }

  async deleteScreen(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Screen not found");
      }
      const screen = await Screen.findById(id);
      if (!screen) {
        throw new Error("Screen not found");
      }

      // This check assumes the showtime model uses 'screen_id'. Adjust if necessary.
      const showtimeExists = await ShowTime.exists({ screen_id: id });
      if (showtimeExists) {
        throw new Error("Cannot delete screen with existing showtimes");
      }

      await Screen.findByIdAndDelete(id);
      return { message: "Screen deleted successfully" };
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new Error("Screen not found");
      }
      throw new Error(`Failed to delete screen: ${error.message}`);
    }
  }

  async suggestMaxColumns(seatCapacity, maxRows) {
    if (isNaN(seatCapacity) || isNaN(maxRows) || maxRows <= 0 || maxRows % 2 !== 0) {
      throw new Error("Max rows must be at least 1 and even");
    }
    if (seatCapacity < 50 || seatCapacity > 250) {
      throw new Error("Seat capacity must be between 50 and 250");
    }
    
    let minColumns = Math.ceil(50.0 / maxRows);
    if (minColumns % 2 !== 0) minColumns++; // Ensure even
    let maxColumns = Math.floor(250.0 / maxRows);
    if (maxColumns % 2 !== 0) maxColumns--; // Ensure even
    
    let suggestedColumns = Math.ceil(seatCapacity / maxRows);
    if (suggestedColumns % 2 !== 0) suggestedColumns++; // Ensure even

    if (suggestedColumns < minColumns || suggestedColumns > maxColumns) {
      throw new Error(
        `Cannot suggest valid columns for ${seatCapacity} seats with ${maxRows} rows. Columns must be between ${minColumns} and ${maxColumns}.`
      );
    }

    const response = {
      suggestedColumns,
      totalSeats: maxRows * suggestedColumns,
    };
    
    if (response.totalSeats !== seatCapacity) {
      response.message = `Suggested layout (${maxRows} rows × ${suggestedColumns} columns = ${response.totalSeats} seats) has ${response.totalSeats - seatCapacity} extra seat(s). Consider adjusting seat_capacity to ${response.totalSeats}.`;
    }

    return response;
  }

  async suggestMaxRows(seatCapacity, maxColumns) {
    if (isNaN(seatCapacity) || isNaN(maxColumns) || maxColumns <= 0 || maxColumns % 2 !== 0) {
      throw new Error("Max columns must be at least 1 and even");
    }
    if (seatCapacity < 50 || seatCapacity > 250) {
      throw new Error("Seat capacity must be between 50 and 250");
    }
    
    let minRows = Math.ceil(50.0 / maxColumns);
    if (minRows % 2 !== 0) minRows++; // Ensure even
    let maxRows = Math.floor(250.0 / maxColumns);
    if (maxRows % 2 !== 0) maxRows--; // Ensure even
    
    let suggestedRows = Math.ceil(seatCapacity / maxColumns);
    if (suggestedRows % 2 !== 0) suggestedRows++; // Ensure even

    if (suggestedRows < minRows || suggestedRows > maxRows) {
      throw new Error(
        `Cannot suggest valid rows for ${seatCapacity} seats with ${maxColumns} columns. Rows must be between ${minRows} and ${maxRows}.`
      );
    }

    const response = {
      suggestedRows,
      totalSeats: suggestedRows * maxColumns,
    };
    
    if (response.totalSeats !== seatCapacity) {
      response.message = `Suggested layout (${suggestedRows} rows × ${maxColumns} columns = ${response.totalSeats} seats) has ${response.totalSeats - seatCapacity} extra seat(s). Consider adjusting seat_capacity to ${response.totalSeats}.`;
    }

    return response;
  }
}

module.exports = new ScreenManagementService();


