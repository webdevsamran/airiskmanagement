import { Schema, model, Document, Types } from 'mongoose';

export interface ComplianceRule extends Document {
  organizationId: Types.ObjectId;
  name: string;
  description?: string;
  category: 'privacy' | 'access' | 'security' | 'retention';
  severity: 'low' | 'medium' | 'high' | 'critical';
  logic: {
    type: 'regex' | 'nlp' | 'llm';
    expression: string;
    languageModelConfig?: {
      provider: 'openai' | 'anthropic';
      model: string;
      promptTemplate: string;
    };
  };
  enabled: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceRuleSchema = new Schema<ComplianceRule>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['privacy', 'access', 'security', 'retention'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    logic: {
      type: {
        type: String,
        enum: ['regex', 'nlp', 'llm'],
        required: true,
      },
      expression: { type: String, required: true },
      languageModelConfig: {
        provider: { type: String, enum: ['openai', 'anthropic'] },
        model: String,
        promptTemplate: String,
      },
    },
    enabled: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const ComplianceRuleModel = model<ComplianceRule>(
  'ComplianceRule',
  ComplianceRuleSchema
);
