import { performanceReportExample } from '../examples/index.ts';

export const performanceReportWorkflowPaths = {
  '/api/v1/documents/performance-reports/draft': {
    post: {
      tags: ['Performance Reports'],
      summary: 'Create performance report draft',
      description:
        'Creates a new performance report draft and generates its PDF. Only manager can perform this action.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['payload'],
              properties: {
                payload: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
            examples: {
              createDraft: {
                summary: 'Create manager draft',
                value: performanceReportExample,
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'PDF streamed in response',
          content: {
            'application/pdf': {
              schema: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
        400: { description: 'Validation error' },
        403: { description: 'Forbidden by role' },
      },
    },
  },

  '/api/v1/documents/performance-reports/{id}/draft': {
    patch: {
      tags: ['Performance Reports'],
      summary: 'Update performance report draft',
      description:
        'Allows manager to update performance report payload while report is in draft or rejected_by_hr status.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['payload'],
              properties: {
                payload: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
            examples: {
              updateDraft: {
                summary: 'Update manager draft',
                value: {
                  payload: {
                    ...performanceReportExample.payload,
                    reviewerName: 'Priyanshu Mishra',
                    reviewerTitle: 'Project Manager',
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Draft updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        400: { description: 'Validation error' },
        403: { description: 'Forbidden by role' },
        409: { description: 'Invalid status transition or locked report' },
      },
    },
  },

  '/api/v1/documents/performance-reports/{id}/submit-to-hr': {
    post: {
      tags: ['Performance Reports'],
      summary: 'Submit draft report to HR',
      description:
        'Moves approvalStatus from draft/rejected_by_hr to submitted_to_hr. Only manager can perform this action.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Submitted to HR',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        403: { description: 'Forbidden by role' },
        409: { description: 'Invalid status transition or locked report' },
      },
    },
  },

  '/api/v1/documents/performance-reports/{id}/hr-review': {
    post: {
      tags: ['Performance Reports'],
      summary: 'HR review with approve or reject',
      description:
        'HR reviews submitted report. When approved, hrSignatureUrl is required and HR signature is inserted in acknowledgement section.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['decision'],
              properties: {
                decision: {
                  type: 'string',
                  enum: ['approve', 'reject'],
                },
                hrSignatureUrl: {
                  type: 'string',
                  format: 'uri',
                },
                hrName: {
                  type: 'string',
                },
                remarks: {
                  type: 'string',
                },
              },
            },
            examples: {
              approve: {
                summary: 'Approve report',
                value: {
                  decision: 'approve',
                  hrName: 'Shruti Kabra',
                  hrSignatureUrl:
                    'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
                  remarks: 'Reviewed and approved.',
                },
              },
              reject: {
                summary: 'Reject report',
                value: {
                  decision: 'reject',
                  hrName: 'Shruti Kabra',
                  remarks: 'Please update reviewer comments and final rating rationale.',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'HR review completed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        400: { description: 'Validation error' },
        403: { description: 'Forbidden by role' },
        409: { description: 'Invalid status transition or locked report' },
      },
    },
  },

  '/api/v1/documents/performance-reports/{id}/send-to-employee': {
    post: {
      tags: ['Performance Reports'],
      summary: 'Send reviewed report to employee',
      description: 'Moves approvalStatus from approved_by_hr to sent_to_employee. Only HR can perform this action.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Report sent to employee',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        403: { description: 'Forbidden by role' },
        409: { description: 'Invalid status transition or locked report' },
      },
    },
  },

  '/api/v1/documents/performance-reports/{id}/acknowledge': {
    post: {
      tags: ['Performance Reports'],
      summary: 'Employee acknowledgement',
      description:
        'Employee acknowledges own report. Employee name and timestamp are written into employee signature section and persisted. Report is locked after this action.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                employeeName: {
                  type: 'string',
                },
              },
            },
            examples: {
              acknowledgement: {
                summary: 'Acknowledge report',
                value: {
                  employeeName: 'Mohammed Shanawaz',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Report acknowledged and locked',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        403: { description: 'Forbidden by role or ownership' },
        409: { description: 'Invalid status transition or locked report' },
      },
    },
  },

  '/api/v1/documents/performance-reports/getMyPerformanceReport': {
    get: {
      tags: ['Performance Reports'],
      summary: 'Get my performance reports',
      description:
        'Returns performance report metadata for the authenticated employee. Only reports already shared with the employee are visible.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'approvalStatus', in: 'query', schema: { type: 'string', enum: ['sent_to_employee', 'acknowledged_by_employee'] } },
        { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
      ],
      responses: {
        200: {
          description: 'Employee performance reports metadata response',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        403: { description: 'Only employee can access own performance reports' },
      },
    },
  },

  '/api/v1/documents/performance-reports/getMyPerformanceReportById/{id}': {
    get: {
      tags: ['Performance Reports'],
      summary: 'Get my performance report by id',
      description:
        'Returns one performance report record with payload for the authenticated employee. Only the owner employee can access it after it is shared.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Employee performance report detail response',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        403: { description: 'Forbidden by role or ownership' },
        404: { description: 'Performance report not found' },
      },
    },
  },
};
