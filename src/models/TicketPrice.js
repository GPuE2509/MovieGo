import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const TicketPrice = sequelize.define('TicketPrice', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  typeSeat: {
    type: DataTypes.ENUM('NORMAL', 'VIP', 'COUPLE'),
    allowNull: false,
    field: 'type_seat'
  },
  typeMovie: {
    type: DataTypes.ENUM('2D', '3D', '4DX', 'IMAX'),
    allowNull: false,
    field: 'type_movie'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  dayType: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'day_type'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  }
}, {
  tableName: 'ticket_prices',
  timestamps: false
});
