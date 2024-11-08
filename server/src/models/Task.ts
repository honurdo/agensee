import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId; // Yeni eklenen alan
  dueDate?: Date;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur'],
    trim: true
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
    default: 'TODO'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: [true, 'Öncelik zorunludur']
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Müşteri seçimi zorunludur']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Atanacak kişi zorunludur']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date
  },
  labels: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export const Task = mongoose.model<ITask>('Task', taskSchema);