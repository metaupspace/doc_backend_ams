import { PERFORMANCE_REPORT_DEFAULT_PAYLOAD } from '../../../modules/document/config/performanceReport.config.ts';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const getCellText = (cell: unknown): string | undefined => {
  if (typeof cell === 'string') {
    return cell;
  }

  if (cell && typeof cell === 'object' && 'text' in cell) {
    const value = (cell as { text?: unknown }).text;
    return typeof value === 'string' ? value : undefined;
  }

  return undefined;
};

const isTableBlock = (block: unknown): block is { type: 'table'; rows: Array<{ cells?: unknown[] }> } =>
  !!block && typeof block === 'object' && (block as { type?: string }).type === 'table' &&
  Array.isArray((block as { rows?: unknown[] }).rows);

const payload = {
  employeeId: 'HR-0001',
  employeeName: 'Mohammed Shanawaz',
  designation: 'Backend Engineer',
  department: 'Human Resources Technology',
  reviewerName: 'Priyanshu Mishra',
  reviewerTitle: 'Project Manager',
  ...clone(PERFORMANCE_REPORT_DEFAULT_PAYLOAD),
};

if (Array.isArray(payload.blocks)) {
  const sectionCHeadingIndex = payload.blocks.findIndex(
    (block) => block?.type === 'heading' && block?.text === 'Section C: Project Based Performance'
  );

  if (sectionCHeadingIndex >= 0) {
    payload.blocks[sectionCHeadingIndex + 1] = {
      type: 'project-reviews',
      projects: [
        {
          projectName: 'AMS Document Generator Revamp',
          employeeRole: 'Backend Developer',
          criteria: [
            {
              characteristic: 'Project Planning and Scoping',
              rating: '4',
              remarks: 'Created practical execution plans with clear ownership and dependencies.',
            },
            {
              characteristic: 'Project Execution & Delivery',
              rating: '5',
              remarks: 'Delivered dynamic report rendering and export flow within timeline.',
            },
            {
              characteristic: 'Cross-Functional Collaboration',
              rating: '4',
              remarks: 'Worked closely with HR and PM to finalize payload requirements.',
            },
            {
              characteristic: 'Milestone & Deadline Adherence',
              rating: '4',
              remarks: 'Met planned sprint milestones with transparent status updates.',
            },
            {
              characteristic: 'Risk Identification & Resolution',
              rating: '5',
              remarks: 'Proactively identified rendering edge cases and fixed them early.',
            },
          ],
        },
        {
          projectName: 'Employee Exit Workflow Automation',
          employeeRole: 'Module Owner',
          criteria: [
            {
              characteristic: 'Project Planning and Scoping',
              rating: '4',
              remarks: 'Defined clear phase-wise rollout for section-level form generation.',
            },
            {
              characteristic: 'Project Execution & Delivery',
              rating: '4',
              remarks: 'Stabilized exit form generation with improved payload handling.',
            },
            {
              characteristic: 'Cross-Functional Collaboration',
              rating: '4',
              remarks: 'Coordinated with HR for data fields and compliance-related details.',
            },
            {
              characteristic: 'Milestone & Deadline Adherence',
              rating: '4',
              remarks: 'Delivered each section with consistent formatting in planned sprints.',
            },
            {
              characteristic: 'Risk Identification & Resolution',
              rating: '4',
              remarks: 'Managed pagination and signature placement issues effectively.',
            },
          ],
        },
      ],
    };
  }

  const acknowledgementTable = payload.blocks.find(
    (block) =>
      isTableBlock(block) &&
      block.rows.some((row) => Array.isArray(row?.cells) && getCellText(row.cells[0]) === 'Signature')
  );

  if (isTableBlock(acknowledgementTable)) {
    const signatureRow = acknowledgementTable.rows.find(
      (row) => Array.isArray(row?.cells) && getCellText(row.cells[0]) === 'Signature'
    );

    if (signatureRow && Array.isArray(signatureRow.cells) && signatureRow.cells.length >= 4) {
      signatureRow.cells[1] = {
        kind: 'image',
        imageUrl:
          'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
      };
      signatureRow.cells[2] = '';
      signatureRow.cells[3] = '';
    }
  }
}

export const performanceReportExample = {
  payload,
};