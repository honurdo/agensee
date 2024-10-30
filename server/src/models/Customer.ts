import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  monthlySpendings: number;
  sector: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema({
  company: {
    type: String,
    required: [true, 'Şirket adı zorunludur'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'İletişim kişisi zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email zorunludur'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    default: 'pending'
  },
  monthlySpendings: {
    type: Number,
    required: [true, 'Aylık harcama zorunludur'],
    min: 0
  },
  sector: {
    type: String,
    required: [true, 'Sektör zorunludur'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);