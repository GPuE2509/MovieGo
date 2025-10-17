import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserCoupon = sequelize.define('UserCoupon', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  couponId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'coupon_id',
    references: {
      model: 'coupons',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'user_coupons',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'coupon_id']
    }
  ]
});
