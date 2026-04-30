import mongoose from 'mongoose';
import { DOCUMENT_TYPES } from '../config/document.config.ts';
import { PERFORMANCE_REPORT_APPROVAL_STATUSES } from '../config/performanceReportApproval.config.ts';

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
    approvalStatus: {
      type: String,
      enum: [...PERFORMANCE_REPORT_APPROVAL_STATUSES],
      default: 'draft',
      index: true,
    },
    approvalStatusHistory: [
      {
        status: {
          type: String,
          enum: [...PERFORMANCE_REPORT_APPROVAL_STATUSES],
          required: true,
        },
        changedAt: {
          type: Date,
          required: true,
        },
        changedById: String,
        changedByName: String,
        remarks: String,
      },
    ],
    submittedToHrAt: Date,
    submittedToHrById: String,
    hrReviewedAt: Date,
    hrReviewedById: String,
    hrReviewedByName: String,
    hrSignatureUrl: String,
    hrReviewRemarks: String,
    sentToEmployeeAt: Date,
    sentToEmployeeById: String,
    employeeAcknowledgedAt: Date,
    employeeAcknowledgedById: String,
    employeeAcknowledgedByName: String,
    employeeAcknowledgementSignatureText: String,
    lockedAt: Date,
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ createdAt: -1 });
documentSchema.index({ documentType: 1, status: 1 });
documentSchema.index({ documentType: 1, approvalStatus: 1 });
documentSchema.index({ employeeId: 1, createdAt: -1 });
documentSchema.index({ employeeName: 1, createdAt: -1 });
documentSchema.index({ hrName: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
