const PaymentMethod = require('../models/paymentMethod');
const Payment = require('../models/payment');

class PaymentManagementService {
  async addPaymentMethod(data) {
    try {
      // Check if payment method with same name already exists
      const existingMethod = await PaymentMethod.findOne({ 
        name: { $regex: new RegExp(`^${data.name}$`, 'i') } 
      });
      
      if (existingMethod) {
        throw new Error('Payment method with this name already exists');
      }

      // Validate gateway_config if provided
      if (data.gateway_config) {
        this.validateGatewayConfig(data.gateway_config);
      }

      const paymentMethod = await PaymentMethod.create(data);
      return paymentMethod;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Payment method with this name already exists');
      }
      throw error;
    }
  }

  async getAllPaymentMethods({ page = 0, size = 10, search, is_active }) {
    try {
      const query = {};
      
      // Add search filter
      if (search && search.trim()) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Add active filter
      if (is_active !== undefined) {
        query.is_active = is_active;
      }

      const pageNum = Math.max(parseInt(page) || 0, 0);
      const sizeNum = Math.min(Math.max(parseInt(size) || 10, 1), 100);

      const [items, total] = await Promise.all([
        PaymentMethod.find(query)
          .sort({ created_at: -1 })
          .skip(pageNum * sizeNum)
          .limit(sizeNum),
        PaymentMethod.countDocuments(query)
      ]);

      return {
        content: items,
        totalElements: total,
        totalPages: Math.ceil(total / sizeNum),
        size: sizeNum,
        number: pageNum
      };
    } catch (error) {
      throw error;
    }
  }

  async deletePaymentMethod(id) {
    try {
      // Check if payment method exists
      const paymentMethod = await PaymentMethod.findById(id);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      // Check if payment method is being used in any payments
      const paymentsUsingMethod = await Payment.countDocuments({ 
        payment_method_id: id 
      });
      
      if (paymentsUsingMethod > 0) {
        throw new Error('Cannot delete payment method that is being used in payments');
      }

      // Delete the payment method
      await PaymentMethod.findByIdAndDelete(id);
      
      return { message: 'Payment method deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getPaymentMethodById(id) {
    try {
      const paymentMethod = await PaymentMethod.findById(id);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }
      return paymentMethod;
    } catch (error) {
      throw error;
    }
  }

  async updatePaymentMethod(id, data) {
    try {
      // Check if payment method exists
      const existingMethod = await PaymentMethod.findById(id);
      if (!existingMethod) {
        throw new Error('Payment method not found');
      }

      // Check for duplicate name if name is being updated
      if (data.name && data.name !== existingMethod.name) {
        const duplicateMethod = await PaymentMethod.findOne({ 
          name: { $regex: new RegExp(`^${data.name}$`, 'i') },
          _id: { $ne: id }
        });
        
        if (duplicateMethod) {
          throw new Error('Payment method with this name already exists');
        }
      }

      // Validate gateway_config if provided
      if (data.gateway_config) {
        this.validateGatewayConfig(data.gateway_config);
      }

      const updatedMethod = await PaymentMethod.findByIdAndUpdate(
        id, 
        data, 
        { new: true, runValidators: true }
      );

      return updatedMethod;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Payment method with this name already exists');
      }
      throw error;
    }
  }

  validateGatewayConfig(gatewayConfig) {
    // Basic validation for gateway configuration
    if (typeof gatewayConfig !== 'object' || gatewayConfig === null) {
      throw new Error('Gateway configuration must be a valid object');
    }

    // You can add more specific validations based on gateway type
    // For example, validate required fields for specific gateways
    if (gatewayConfig.gateway_type) {
      switch (gatewayConfig.gateway_type.toLowerCase()) {
        case 'vnpay':
          if (!gatewayConfig.tmn_code || !gatewayConfig.hash_secret) {
            throw new Error('VNPay configuration requires tmn_code and hash_secret');
          }
          break;
        case 'paypal':
          if (!gatewayConfig.client_id || !gatewayConfig.client_secret) {
            throw new Error('PayPal configuration requires client_id and client_secret');
          }
          break;
        case 'momo':
          if (!gatewayConfig.partner_code || !gatewayConfig.access_key || !gatewayConfig.secret_key) {
            throw new Error('MoMo configuration requires partner_code, access_key, and secret_key');
          }
          break;
        default:
          // For custom gateways, just ensure it's a valid object
          break;
      }
    }
  }
}

module.exports = new PaymentManagementService();
