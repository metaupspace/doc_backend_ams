export type PerformanceReportCell =
  | string
  | {
      text?: string;
      bold?: boolean;
      align?: 'left' | 'center' | 'right';
      kind?: 'text' | 'checkbox' | 'image';
      checked?: boolean;
      imageUrl?: string;
      colSpan?: number;
      size?: number;
    };

export type PerformanceReportTableRow = {
  header?: boolean;
  minHeight?: number;
  cells: PerformanceReportCell[];
};

export type PerformanceProjectReview = {
  projectName: string;
  employeeRole: string;
  criteria: Array<{
    characteristic: string;
    rating: string;
    remarks: string;
  }>;
};

export type PerformanceReportBlock =
  | {
      type: 'heading';
      text: string;
      size?: number;
      align?: 'left' | 'center' | 'right';
      marginTop?: number;
      marginBottom?: number;
    }
  | {
      type: 'text';
      text: string;
      size?: number;
      lineGap?: number;
      align?: 'left' | 'center' | 'right';
      bold?: boolean;
      marginTop?: number;
      marginBottom?: number;
    }
  | {
      type: 'table';
      title?: string;
      marginTop?: number;
      marginBottom?: number;
      repeatHeader?: boolean;
      columnWidths?: number[];
      rows: PerformanceReportTableRow[];
    }
  | {
      type: 'project-reviews';
      marginTop?: number;
      marginBottom?: number;
      projects: PerformanceProjectReview[];
    }
  | {
      type: 'spacer';
      height?: number;
    };

export type PerformanceReportPayload = {
  title?: string;
  blocks?: PerformanceReportBlock[];
};

export const PERFORMANCE_REPORT_DEFAULT_PAYLOAD: PerformanceReportPayload = {
  title: 'EMPLOYEE PERFORMANCE REPORT',
  blocks: [
    { type: 'heading', text: 'Employee Information', align: 'center', marginTop: 6, marginBottom: 14 },
    {
      type: 'table',
      rows: [
        {
          header: true,
          cells: [
            { text: 'EMPLOYEE NAME', bold: true, align: 'center' },
            { text: 'EMPLOYEE ID', bold: true, align: 'center' },
            { text: 'DATE OF CURRENT REVIEW', bold: true, align: 'center' },
          ],
        },
        {
          cells: [
            { text: 'Mohammed Shanawaz', align: 'center' },
            { text: 'HR-0001', align: 'center' },
            { text: '17th September, 2025', align: 'center' },
          ],
        },
        {
          header: true,
          cells: [
            { text: 'POSITION HELD', bold: true, align: 'center' },
            { text: 'DEPARTMENT', bold: true, align: 'center' },
            { text: 'DATE OF LAST REVIEW', bold: true, align: 'center' },
          ],
        },
        {
          cells: [
            { text: 'AI Engineer', align: 'center' },
            { text: 'AI Development', align: 'center' },
            { text: 'NA', align: 'center' },
          ],
        },
        {
          header: true,
          cells: [
            { text: 'REVIEWER NAME', bold: true, align: 'center' },
            { text: 'REVIEWER TITLE', bold: true, align: 'center' },
            { text: 'DATE SUBMITTED', bold: true, align: 'center' },
          ],
        },
        {
          cells: [
            { text: 'Priyanshu Mishra', align: 'center' },
            { text: 'Project Manager', align: 'center' },
            { text: '17 September, 2025', align: 'center' },
          ],
        },
      ],
    },
    { type: 'spacer', height: 12 },
    { type: 'heading', text: 'Section A: Technical & Execution Skills', align: 'center', marginBottom: 12 },
    {
      type: 'table',
      columnWidths: [1.5, 0.55, 2.45],
      rows: [
        {
          header: true,
          cells: [
            { text: 'CHARACTERISTICS', bold: true, align: 'center' },
            { text: 'RATING', bold: true, align: 'center' },
            { text: 'REMARKS', bold: true, align: 'center' },
          ],
        },
        { cells: ['Technical Skills', '4', 'Built reusable backend modules and improved API response consistency.'] },
        { cells: ['Task & Timeline Management', '4', 'Planned sprint tasks clearly and met agreed delivery timelines.'] },
        { cells: ['Quality of Work Delivered', '5', 'Delivered low-defect releases with strong code review feedback.'] },
        { cells: ['Productivity & Efficiency', '4', 'Reduced repetitive manual work through automation scripts.'] },
        { cells: ['Problem Solving & Initiative', '5', 'Took ownership of critical production issues and resolved them quickly.'] },
      ],
    },
    { type: 'heading', text: 'Section B: Communication & Collaboration', align: 'center', marginTop: 16, marginBottom: 12 },
    {
      type: 'table',
      columnWidths: [1.5, 0.55, 2.45],
      rows: [
        {
          header: true,
          cells: [
            { text: 'CHARACTERISTICS', bold: true, align: 'center' },
            { text: 'RATING', bold: true, align: 'center' },
            { text: 'REMARKS', bold: true, align: 'center' },
          ],
        },
        { cells: ['Communication Skills', '4', 'Shared clear sprint updates and communicated risks early.'] },
        { cells: ['Teamwork & Collaboration', '5', 'Worked effectively with HR, engineering, and design stakeholders.'] },
        { cells: ['Independent Work & Accountability', '4', 'Handled assigned modules end-to-end with minimal supervision.'] },
        { cells: ['Client Interaction & Professionalism', '4', 'Participated in client demos and handled feedback professionally.'] },
        { cells: ['Adaptability to Feedback & Change', '5', 'Quickly incorporated review feedback and process changes.'] },
      ],
    },
    { type: 'heading', text: 'Section C: Project Based Performance', align: 'center', marginTop: 16, marginBottom: 10 },
    {
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
        {
          projectName: 'Policy Annexure Engine',
          employeeRole: 'Feature Engineer',
          criteria: [
            {
              characteristic: 'Project Planning and Scoping',
              rating: '4',
              remarks: 'Designed annexure structure to keep content fully payload-driven.',
            },
            {
              characteristic: 'Project Execution & Delivery',
              rating: '4',
              remarks: 'Implemented multiple annexures with custom table and signature logic.',
            },
            {
              characteristic: 'Cross-Functional Collaboration',
              rating: '4',
              remarks: 'Aligned technical output with policy and operations stakeholders.',
            },
            {
              characteristic: 'Milestone & Deadline Adherence',
              rating: '4',
              remarks: 'Consistently delivered iterative updates based on visual feedback.',
            },
            {
              characteristic: 'Risk Identification & Resolution',
              rating: '5',
              remarks: 'Handled schema drift and layout regressions without breaking existing documents.',
            },
          ],
        },
      ],
    },
    { type: 'heading', text: 'Section D: Discipline & Professional Conduct', align: 'center', marginTop: 16, marginBottom: 12 },
    {
      type: 'table',
      columnWidths: [1.5, 0.55, 2.45],
      rows: [
        {
          header: true,
          cells: [
            { text: 'CHARACTERISTICS', bold: true, align: 'center' },
            { text: 'RATING', bold: true, align: 'center' },
            { text: 'REMARKS', bold: true, align: 'center' },
          ],
        },
        { cells: ['Work Punctuality', '4', 'Consistently available during core collaboration hours.'] },
        { cells: ['Attendance', '5', 'Maintained excellent attendance across the review period.'] },
        { cells: ['Work Consistency', '4', 'Delivered stable output across multiple document modules.'] },
        { cells: ['Honesty & Integrity', '5', 'Demonstrated transparent communication and strong ownership.'] },
        { cells: ['Adaptability to Feedback & Change', '5', 'Adapted quickly to changing format and review expectations.'] },
      ],
    },
    { type: 'spacer', height: 8 },
    {
      type: 'table',
      columnWidths: [1.65, 1.3, 1.2, 1.2],
      rows: [
        {
          header: true,
          cells: [
            { text: 'EMPLOYEE POTENTIAL', bold: true, align: 'center' },
            { text: 'GROWTH WITHIN FUNCTION', bold: true, align: 'center' },
            { text: 'PROMOTABLE IN THE LONG TERM', bold: true, align: 'center' },
            { text: 'PROMOTABLE IN THE SHORT TERM', bold: true, align: 'center' },
          ],
        },
        {
          cells: [
            'How would you qualify the employee\'s potential?',
            { kind: 'checkbox', checked: true, align: 'center' },
            { kind: 'checkbox', checked: true, align: 'center' },
            { kind: 'checkbox', checked: false, align: 'center' },
          ],
        },
      ],
    },
    { type: 'heading', text: 'Section E: Review & Development Outlook', align: 'center', marginTop: 16, marginBottom: 12 },
    {
      type: 'table',
      rows: [
        { header: true, cells: [{ text: 'Were previously set goals achieved?', bold: true }] },
        {
          minHeight: 72,
          cells: [
            'Yes. The employee completed all major delivery goals for the quarter, including performance-report generator rollout, payload standardization, and Swagger alignment.',
          ],
        },
      ],
    },
    { type: 'spacer', height: 8 },
    {
      type: 'table',
      rows: [
        { header: true, cells: [{ text: 'Goals for next period', bold: true }] },
        {
          minHeight: 72,
          cells: [
            '1) Add strict schema-level validations for dynamic table payloads. 2) Improve generator performance for long multi-page reports by 20%. 3) Add report versioning and audit metadata for compliance.',
          ],
        },
      ],
    },
    { type: 'spacer', height: 8 },
    {
      type: 'table',
      rows: [
        { header: true, cells: [{ text: 'Key Achievements', bold: true }] },
        {
          minHeight: 72,
          cells: [
            'Led delivery of three high-impact document initiatives, strengthened role-based access handling for sensitive report types, and reduced manual PDF formatting iterations through payload-first design.',
          ],
        },
      ],
    },
    { type: 'spacer', height: 8 },
    {
      type: 'table',
      rows: [
        { header: true, cells: [{ text: 'Points of Improvement', bold: true }] },
        {
          minHeight: 72,
          cells: [
            'Can improve early documentation of edge cases and increase test coverage for complex nested payload scenarios before release.',
          ],
        },
      ],
    },
    { type: 'spacer', height: 8 },
    {
      type: 'table',
      rows: [
        { header: true, cells: [{ text: 'Training and Development Recommendations', bold: true }] },
        {
          minHeight: 72,
          cells: [
            'Advanced training on scalable PDF rendering patterns, API contract validation, and leadership mentoring for cross-team requirement workshops.',
          ],
        },
      ],
    },
    { type: 'spacer', height: 8 },
    {
      type: 'table',
      rows: [
        { header: true, cells: [{ text: "Manager's Overall Feedback", bold: true }] },
        {
          minHeight: 72,
          cells: [
            'Mohammed has shown strong ownership and execution maturity. He consistently delivers quality work, communicates risks early, and collaborates effectively with business and technical stakeholders.',
          ],
        },
      ],
    },
    { type: 'spacer', height: 8 },
    {
      type: 'table',
      rows: [
        { header: true, cells: [{ text: 'Final Rating', bold: true }] },
        { minHeight: 72, cells: ['4.6 / 5 - Exceeds Expectations'] },
      ],
    },
    { type: 'heading', text: 'Acknowledgement', marginTop: 14, marginBottom: 10, align: 'center' },
    {
      type: 'table',
      columnWidths: [1.1, 1.9, 1.7, 1.9],
      rows: [
        {
          header: true,
          cells: [
            '',
            { text: 'Reviewer', bold: true, align: 'center' },
            { text: 'HR', bold: true, align: 'center' },
            { text: 'Employee', bold: true, align: 'center' },
          ],
        },
        { cells: [{ text: 'Name', bold: true }, 'Mr. Priyanshu Mishra', 'Ms. Shruti Kabra', 'Mohammed Shanawaz'] },
        {
          cells: [
            { text: 'Signature', bold: true },
            {
              kind: 'image',
              imageUrl:
                'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
            },
            {
              kind: 'image',
              imageUrl:
                'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
            },
            {
              kind: 'image',
              imageUrl:
                'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
            },
          ],
        },
        { cells: [{ text: 'Date', bold: true }, '17 September 2025', '17 September 2025', '17 September 2025'] },
      ],
    },
    { type: 'spacer', height: 8 },
    {
      type: 'text',
      text:
        'Note: The performance of each KPI is evaluated on a standardized 5-point scale as follows:\n5 - Outstanding\n4 - Exceeds Expectations\n3 - Meets Expectations\n2 - Needs Improvement\n1 - Unsatisfactory',
      size: 10,
      lineGap: 4,
      marginBottom: 0,
    },
  ],
};