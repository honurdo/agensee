import mongoose, { Schema, Document, Model } from 'mongoose';

interface CommissionTier {
  minAmount: number;
  maxAmount: number | null;
  rate: number;
  feeType: 'PERCENTAGE' | 'FIXED';
  fixedAmount?: number;
}

export interface ICustomer extends Document {
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  status: 'active' | 'pending' | 'inactive';
  monthlySpendings: number;
  sector: string;
  notes?: string;
  commissionTiers: CommissionTier[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  billingInfo: BillingInfo;

}

export interface ICustomerDocument extends ICustomer, Document {
  commissionTiers: CommissionTier[];
}
export interface BillingInfo {
  taxOffice?: string;          // Vergi Dairesi
  taxNumber?: string;          // Vergi No / TC Kimlik No
  billingAddress?: string;     // Fatura Adresi
  billingType: 'CORPORATE' | 'INDIVIDUAL';  // Kurumsal / Bireysel
  companyTitle?: string;       // Firma Ünvanı (Kurumsal için)
}

export interface ICustomerModel extends Model<ICustomerDocument> {
  // Model statik metodları buraya eklenebilir
}

const commissionTierSchema = new Schema({
  minAmount: { 
    type: Number, 
    required: [true, 'Minimum tutar zorunludur'],
    min: [0, 'Minimum tutar 0 veya daha büyük olmalıdır']
  },
  maxAmount: { 
    type: Number, 
    default: null
  },
  rate: { 
    type: Number,
    validate: [{
      validator: function(this: any, value: number) {
        return this.feeType !== 'PERCENTAGE' || (value >= 0 && value <= 100);
      },
      message: 'Komisyon oranı 0-100 arasında olmalıdır'
    }]
  },
  feeType: { 
    type: String, 
    enum: {
      values: ['PERCENTAGE', 'FIXED'] as const,
      message: 'Ücret tipi PERCENTAGE veya FIXED olmalıdır'
    },
    required: [true, 'Ücret tipi zorunludur']
  },
  fixedAmount: { 
    type: Number, 
    validate: [{
      validator: function(this: any, value: number) {
        return this.feeType !== 'FIXED' || value >= 0;
      },
      message: 'Sabit ücret 0 veya daha büyük olmalıdır'
    }]
  }
});

const customerSchema = new Schema({
  company: {
    type: String,
    required: [true, 'Şirket adı zorunludur'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return v && v.length > 0 && v !== 'undefined';
      },
      message: 'Geçerli bir şirket adı girilmelidir'
    }
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
  website: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'pending', 'inactive'] as const,
      message: 'Geçersiz durum değeri'
    },
    default: 'pending'
  },
  monthlySpendings: {
    type: Number,
    required: [true, 'Aylık harcama zorunludur'],
    min: [0, 'Aylık harcama 0 veya daha büyük olmalıdır']
  },
  sector: {
    type: String,
    required: [true, 'Sektör zorunludur'],
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  billingInfo: {
    billingType: {
      type: String,
      enum: ['CORPORATE', 'INDIVIDUAL'],
      default: 'CORPORATE'
    },
    taxOffice: String,
    taxNumber: String,
    billingAddress: String,
    companyTitle: String
  },
  commissionTiers: {
    type: [commissionTierSchema],
    default: [],
    validate: [{
      validator: function(tiers: any[]) {
        if (!tiers || !Array.isArray(tiers) || tiers.length <= 1) return true;
        
        // Aralıkların sıralı ve mantıklı olduğunu kontrol et
        for (let i = 0; i < tiers.length - 1; i++) {
          const currentTier = tiers[i];
          const nextTier = tiers[i + 1];
          
          // Null/undefined kontrolü ekleyelim
          if (currentTier?.maxAmount != null && nextTier?.minAmount != null) {
            if (currentTier.maxAmount >= nextTier.minAmount) {
              return false;
            }
          }
        }
        return true;
      },
      message: 'Komisyon aralıkları mantıklı ve sıralı olmalıdır'
    }]
  }
}, {
  timestamps: true
});

// Pre-save hook'u
function sortCommissionTiers(doc: any) {
  if (doc.commissionTiers?.length > 0) {
    doc.commissionTiers.sort((a: any, b: any) => a.minAmount - b.minAmount);
  }
}

customerSchema.pre('validate', function(next) {
  sortCommissionTiers(this);
  next();
});

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);