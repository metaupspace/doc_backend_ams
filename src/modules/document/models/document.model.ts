import mongoose from 'mongoose';
import { DOCUMENT_TYPES } from '../config/document.config.ts';

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: DOCUMENT_TYPES,
      required: true,
    },
    employeeId: {
      type: String,
      index: true,
    },
    employeeName: {
      type: String,
      index: true,
    },
    hrId: {
      type: String,
      index: true,
    },
    hrName: {
      type: String,
      index: true,
    },
    managerId: {
      type: String,
      index: true,
    },
    requestMetadata: {
      userId: String,
      ip: String,
      userAgent: String,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'success', 'failure'],
      default: 'processing',
    },
    documentIdentifier: {
      type: String,
      index: true,
    },
    fileName: String,
    pdfMimeType: {
      type: String,
      default: 'application/pdf',
    },
    errorMessage: String,
    fileSize: Number,
    generationTime: Number,
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ createdAt: -1 });
documentSchema.index({ documentType: 1, status: 1 });
documentSchema.index({ employeeId: 1, createdAt: -1 });
documentSchema.index({ employeeName: 1, createdAt: -1 });
documentSchema.index({ hrName: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
