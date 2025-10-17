import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'coupon_name',
    validate: {
      notEmpty: true
    }
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'coupon_code',
    validate: {
      notEmpty: true
    }
  },
  value: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'coupon_value',
    validate: {
      min: 0
    }
  },
  exchangePoint: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'exchange_point',
    validate: {
      min: 0
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'coupons',
  timestamps: false,
  hooks: {
    beforeCreate: (coupon) => {
      coupon.createdAt = new Date();
      coupon.updatedAt = new Date();
    },
    beforeUpdate: (coupon) => {
      coupon.updatedAt = new Date();
    }
  }
});
