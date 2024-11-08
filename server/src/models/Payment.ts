// models/Payment.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  customerId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  serviceType: string;
  bank?: string;
  hasCommission: boolean;
  commissionRate?: number;
  commissionAmount: number;
  hasVAT: boolean;
  isVATExempt: boolean;
  vatAmount: number;
  netAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema({
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  paymentDate: { 
    type: Date, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['CREDIT_CARD', 'BANK_TRANSFER'] 
  },
  serviceType: { 
    type: String, 
    required: true,
    enum: ['GOOGLE_ADS', 'META_ADS', 'GOOGLE_BUSINESS', 'SOCIAL_MEDIA', 'AI_CONSULTING']
  },
  bank: { 
    type: String 
  },
  hasCommission: { 
    type: Boolean, 
    default: false 
  },
  commissionRate: { 
    type: Number 
  },
  commissionAmount: { 
    type: Number 
  },
  hasVAT: { 
    type: Boolean, 
    default: true 
  },
  isVATExempt: { 
    type: Boolean, 
    default: false 
  },
  vatAmount: { 
    type: Number 
  },
  netAmount: { 
    type: Number, 
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
