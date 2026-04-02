import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.ts';
import { generatePDFBuffer } from '../src/modules/document/generators/document.generator.ts';
import { validateDocumentRequest } from '../src/modules/document/validators/document.validation.ts';

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

// Test PDF generation for report
test('validateDocumentRequest - should accept valid offer-letter request', () => {
  const payload = {
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    designation: 'Engineer',
    joiningDate: '2024-01-15',
  };

  const { error, value } = validateDocumentRequest('offer-letter', { payload });
  assert(!error, 'Should not have validation errors');
  assert.equal(value.payload.employeeName, 'John Doe');
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
