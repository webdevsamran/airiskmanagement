import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Task extends MongooseDocument {
  violationId: Types.ObjectId;
  assignedTo: Types.ObjectId;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'done';
  notes: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<Task>(
  {
    violationId: { type: Schema.Types.ObjectId, ref: 'Violation', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'done'],
      default: 'pending',
      required: true,
    },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true } // auto-creates `createdAt` and `updatedAt`
);

export const TaskModel = model<Task>('Task', TaskSchema);
