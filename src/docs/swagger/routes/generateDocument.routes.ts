import { genericExampleForType } from '../examples/index.ts';

const GENERATOR_DOCUMENT_ROUTES = [
  {
    documentType: 'appraisal-letter',
    summary: 'Generate appraisal letter PDF',
    exampleName: 'appraisalLetterPayload',
  },
  {
    documentType: 'contractual-letter',
    summary: 'Generate contractual letter PDF',
    exampleName: 'contractualLetterPayload',
  },
  {
    documentType: 'letter-of-intent',
    summary: 'Generate letter of intent PDF',
    exampleName: 'letterOfIntentPayload',
  },
  {
    documentType: 'internship-offer-letter',
    summary: 'Generate internship offer letter PDF',
    exampleName: 'internshipOfferLetterPayload',
  },
  {
    documentType: 'probation-offer-letter',
    summary: 'Generate probation offer letter PDF',
    exampleName: 'probationOfferLetterPayload',
  },
  {
    documentType: 'probation-completion-letter',
    summary: 'Generate probation completion letter PDF',
    exampleName: 'probationCompletionLetterPayload',
  },
  {
    documentType: 'joining-letter',
    summary: 'Generate joining letter PDF',
    exampleName: 'joiningLetterPayload',
  },
  {
    documentType: 'promotion-letter',
    summary: 'Generate promotion letter PDF',
    exampleName: 'promotionLetterPayload',
  },
  {
    documentType: 'performance-report',
    summary: 'Generate performance report PDF',
    exampleName: 'performanceReportPayload',
  },
  {
    documentType: 'employee-exit-form',
    summary: 'Generate employee exit form PDF',
    exampleName: 'employeeExitFormPayload',
  },
  {
    documentType: 'policy-generator',
    summary: 'Generate policy annexure PDF',
    exampleName: 'policyGeneratorPayload',
  },
  {
    documentType: 'experience-letter',
    summary: 'Generate work experience letter PDF',
    exampleName: 'workExperienceLetterPayload',
  },
  {
    documentType: 'relieving-letter',
    summary: 'Generate relieving letter PDF',
    exampleName: 'relievingLetterPayload',
  },
  {
    documentType: 'resignation-acceptance-letter',
    summary: 'Generate resignation acceptance letter PDF',
    exampleName: 'resignationAcceptanceLetterPayload',
  },
  {
    documentType: 'termination-letter',
    summary: 'Generate termination letter PDF',
    exampleName: 'terminationLetterPayload',
  },
  {
    documentType: 'warning-letter',
    summary: 'Generate first warning letter PDF',
    exampleName: 'firstWarningLetterPayload',
  },
  {
    documentType: 'warning-and-disciplinary-letter',
    summary: 'Generate warning and disciplinary letter PDF',
    exampleName: 'warningDisciplinaryLetterPayload',
  },
  {
    documentType: 'internship-to-full-time-letter',
    summary: 'Generate internship to full-time letter PDF',
    exampleName: 'internshipToFullTimeLetterPayload',
  },
  {
    documentType: 'internship-completion-certificate',
    summary: 'Generate internship completion certificate PDF',
    exampleName: 'internshipCompletionCertificatePayload',
  },
];

export const generateDocumentPaths = GENERATOR_DOCUMENT_ROUTES.reduce(
  (acc: Record<string, unknown>, route) => {
    const path = `/api/v1/documents/generate/${route.documentType}`;
    acc[path] = {
      post: {
        tags: ['Documents'],
        summary: route.summary,
        description:
          route.documentType === 'internship-completion-certificate'
            ? 'Creates an internship completion certificate on letterhead with dual signatory fields and internship tenure details, then streams the generated PDF.'
            : `Creates a ${route.documentType} document, stores payload in DB, generates PDF and streams it in response.`,
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
                [route.exampleName]: {
                  summary: route.summary,
                  value: genericExampleForType(route.documentType),
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
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden by role',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Employee not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    };
    return acc;
  },
  {}
);
