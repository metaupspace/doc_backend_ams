import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.ts';
import { generatePDFBuffer } from '../src/modules/document/generators/document.generator.ts';
import { validateDocumentRequest } from '../src/modules/document/validators/document.validation.ts';
import {
  normalizeParagraphList,
  normalizeParagraphsWithDefaults,
} from '../src/modules/document/utils/paragraphs.util.ts';

// Test PDF generation for invoice
test('generatePDFBuffer - should create offer-letter PDF', async () => {
  const payload = {
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    designation: 'Engineer',
    joiningDate: '2024-01-15',
  };

  const pdf = await generatePDFBuffer('offer-letter', payload);
  assert(pdf.length > 0, 'PDF buffer should be created');
});

// Test PDF generation for certificate
test('generatePDFBuffer - should create performance-report PDF', async () => {
  const payload = {
    employeeId: 'emp-1',
    employeeName: 'Jane Smith',
    period: 'Q1-2026',
    rating: 4.5,
    managerRemarks: 'Strong performer',
  };

  const pdf = await generatePDFBuffer('performance-report', payload);
  assert(pdf.length > 0, 'PDF buffer should be created');
});

test('generatePDFBuffer - should create employee-exit-form PDF', async () => {
  const payload = {
    employeeId: 'emp-1',
    employeeName: 'Jane Smith',
    employeeInformation: {
      fullName: 'Jane Smith',
      department: 'Engineering',
    },
    exitClearanceChecklist: {
      reportingManager: 'Cleared',
    },
  };

  const pdf = await generatePDFBuffer('employee-exit-form', payload);
  assert(pdf.length > 0, 'PDF buffer should be created');
});

test('generatePDFBuffer - should create policy-generator PDF', async () => {
  const payload = {
    annexures: [
      {
        annexureId: 'A',
        title: 'Employment Policies',
        blocks: [
          {
            text: '1. Test policy line for annexure A.',
          },
        ],
      },
    ],
  };

  const pdf = await generatePDFBuffer('policy-generator', payload);
  assert(pdf.length > 0, 'PDF buffer should be created');
});

// Test PDF generation for report
test('validateDocumentRequest - should accept valid contractual-letter request', () => {
  const payload = {
    employeeName: 'John Doe',
    paragraphs: ['Paragraph 1', 'Paragraph 2', 'Paragraph 3'],
    signatureUrl: 'https://example.com/signature.png',
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  };

  const { error, value } = validateDocumentRequest('contractual-letter', { payload });
  assert(!error, 'Should not have validation errors');
  assert.equal(value.payload.employeeName, 'John Doe');
});

test('validateDocumentRequest - contractual-letter should keep all custom paragraphs', () => {
  const payload = {
    employeeName: 'Harshit Saini',
    paragraphs: ['P1', 'P2', 'P3', 'P4', 'P5'],
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  };

  const { error, value } = validateDocumentRequest('contractual-letter', { payload });
  assert(!error, 'Should not have validation errors');
  assert.equal(value.payload.paragraphs.length, 5);
  assert.equal(value.payload.paragraphs[4], 'P5');
});

test('validateDocumentRequest - contractual-letter should map alias fields', () => {
  const payload = {
    employeeName: 'Harshit Saini',
    positionTitle: 'ASE',
    compensation: '5000',
    contractEndDate: '5 April 2027',
    paragraphs: ['P1'],
    signatoryName: 'Sahil Jaiswal',
    position: 'CEO & Founder',
  };

  const { error, value } = validateDocumentRequest('contractual-letter', { payload });
  assert(!error, 'Should not have validation errors');
  assert.equal(value.payload.jobTitle, 'ASE');
  assert.equal(value.payload.salaryOrStipend, '5000');
  assert.equal(value.payload.endDate, '5 April 2027');
});

// Test validation - invalid document type
test('validateDocumentRequest - should reject invalid document type', () => {
  const invalidData = {
    payload: {
      data: 'test',
    },
  };

  const { error } = validateDocumentRequest('invalid-type', invalidData);
  assert(error, 'Should have validation errors');
});

// Test validation - missing payload
test('validateDocumentRequest - should reject missing payload', () => {
  const invalidData = {};

  const { error } = validateDocumentRequest('offer-letter', invalidData);
  assert(error, 'Should have validation errors');
});

test('validateDocumentRequest - should reject missing required spec fields', () => {
  const invalidData = {
    payload: {
      employeeId: 'emp-1',
    },
  };

  const { error } = validateDocumentRequest('offer-letter', invalidData);
  assert(error, 'Should have validation errors');
});

test('validateDocumentRequest - should accept employee-exit-form request', () => {
  const payload = {
    employeeId: 'emp-1',
    employeeName: 'Jane Smith',
    employeeInformation: {
      fullName: 'Jane Smith',
    },
  };

  const { error, value } = validateDocumentRequest('employee-exit-form', { payload });
  assert(!error, 'Should not have validation errors');
  assert.equal(value.payload.employeeName, 'Jane Smith');
});

test('validateDocumentRequest - should accept policy-generator request', () => {
  const payload = {
    annexures: [
      {
        annexureId: 'A',
        title: 'Employment Policies',
        blocks: [{ text: 'Sample policy content' }],
      },
    ],
  };

  const { error, value } = validateDocumentRequest('policy-generator', { payload });
  assert(!error, 'Should not have validation errors');
  assert.equal(value.payload.annexures[0].annexureId, 'A');
});

test('normalizeParagraphList - should keep all provided paragraphs', () => {
  const paragraphs = Array.from({ length: 44 }, (_, index) => `Paragraph ${index + 1}`);

  const normalized = normalizeParagraphList({ paragraphs });

  assert.equal(normalized.length, 44);
  assert.equal(normalized[43], 'Paragraph 44');
});

test('normalizeParagraphsWithDefaults - should use only provided paragraphs', () => {
  const paragraphs = ['Paragraph 1'];

  const normalized = normalizeParagraphsWithDefaults(
    { paragraphs },
    ['Default 1', 'Default 2', 'Default 3']
  );

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0], 'Paragraph 1');
});

test('normalizeParagraphsWithDefaults - should use defaults when input is missing', () => {
  const normalized = normalizeParagraphsWithDefaults(
    {},
    ['Default 1', 'Default 2', 'Default 3']
  );

  assert.equal(normalized.length, 3);
  assert.equal(normalized[0], 'Default 1');
  assert.equal(normalized[2], 'Default 3');
});

// Test health check endpoint
test('GET /health - should return 200 OK', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    const json = await res.json();

    assert.equal(res.status, 200, 'Should return 200 status');
    assert.equal(json.status, 'ok', 'Should return ok status');
  } finally {
    server.close();
  }
});

// Test unknown API path resolves to not found
test('GET /unknown under /api - should return 404', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/unknown`);
    const json = await res.json();

    assert.equal(res.status, 404, 'Should return 404 status');
    assert.equal(json.status, 'error', 'Should return error status');
  } finally {
    server.close();
  }
});
