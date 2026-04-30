import Joi from 'joi';

const objectIdSchema = Joi.string().trim().min(1).required();

const draftUpdateSchema = Joi.object({
  payload: Joi.object().required(),
}).required();

const hrReviewSchema = Joi.object({
  decision: Joi.string().valid('approve', 'reject').required(),
  hrName: Joi.string().trim().max(120).optional(),
  remarks: Joi.string().trim().max(1000).allow('').optional(),
}).required();

const employeeAcknowledgeSchema = Joi.object({
  employeeName: Joi.string().trim().max(120).optional(),
}).required();

export const validatePerformanceReportIdParam = (id) =>
  objectIdSchema.validate(id, { abortEarly: false, stripUnknown: true });

export const validatePerformanceReportDraftUpdateRequest = (payload) =>
  draftUpdateSchema.validate(payload, { abortEarly: false, stripUnknown: true });

export const validatePerformanceReportHrReviewRequest = (payload) =>
  hrReviewSchema.validate(payload, { abortEarly: false, stripUnknown: true });

export const validatePerformanceReportEmployeeAcknowledgeRequest = (payload) =>
  employeeAcknowledgeSchema.validate(payload, { abortEarly: false, stripUnknown: true });
