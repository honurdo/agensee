import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

  export enum UserRole {
    CUSTOMER_REPRESENTATIVE = 'customer_representative',
    ACCOUNT_MANAGER = 'account_manager',
    FINANCE = 'finance',
    DESIGN = 'design',
    DEVELOPER = 'developer',
    SALES_MANAGER = 'sales_manager',
    ADMIN = 'admin',
    USER = 'USER'
  }

  export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    active: boolean;
    lastLogin?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
  }

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Şifre hash'leme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;