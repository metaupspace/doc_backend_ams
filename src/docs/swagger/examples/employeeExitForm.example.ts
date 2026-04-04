export const employeeExitFormExample = {
  payload: {
    employeeId: 'EMP-1001',
    employeeName: 'Ravi Kumar',
    date: '06th July, 2025',
    title: 'Employee Exit Form',
    employeeInformation: {
      fullName: 'Ravi Kumar',
      employeeId: 'EMP-1001',
      department: 'Engineering',
      employeeType: 'Full-Time',
      contactInfo: '+91 90000 00000',
      designation: 'Software Engineer',
      dateOfJoining: '01st April, 2023',
      resignationSubmittedDate: '15th June, 2025',
      resignationAcceptedDate: '18th June, 2025',
      lastWorkingDay: '30th June, 2025',
      reportingManager: 'Amit Sharma',
      reasonForResignation: 'Pursuing a new opportunity',
    },
    exitClearanceChecklist: {
      reportingManager: {
        selected: 'Cleared',
        remarks: 'Handover completed and approved',
      },
      humanResources: {
        selected: 'Cleared',
        remarks: 'Exit formalities completed',
      },
      itAdministration: {
        selected: 'Cleared',
        remarks: 'System access revoked and assets verified',
      },
      financeAccounts: {
        selected: 'Cleared',
        remarks: 'No pending dues',
      },
    },
    companyPropertyHandover: [
      {
        assetDescription: 'Reporting Manager',
        returned: 'Yes',
        remarks: 'Role transition checklist signed off by Reporting Manager',
      },
      {
        assetDescription: 'Laptop / Workstation',
        returned: 'Yes',
        remarks: 'Laptop submitted to IT and device health verified',
      },
      {
        assetDescription: 'Charger / Accessories',
        returned: 'Yes',
        remarks: 'All issued accessories received and inventoried',
      },
      {
        assetDescription: 'Access / ID Card',
        returned: 'Yes',
        remarks: 'ID card surrendered and access revoked',
      },
      {
        assetDescription: 'Any Other Equipment (Specify)',
        returned: 'Not Applicable',
        remarks: 'No additional company equipment was assigned',
      },
    ],
    handoverConfirmation: {
      handoverCompletedTo: 'Amit Sharma',
      handoverDate: '29th June, 2025',
      summary:
        'Shared project status, pending tasks, and active client communication threads with the incoming owner.',
      statuses: [
        { field: 'Shared Access / Credentials Transferred', selected: 'Yes' },
        { field: 'Documents/Files Archived and Shared', selected: 'Yes' },
        { field: 'Client/Team Communication Updated', selected: 'Yes' },
      ],
      remarks: 'All',
    },
    reportingManagerNoteInstructions:
      "Kindly provide a brief summary of the employee's performance, contribution to the team, and recommendation regarding future engagement (rehire eligibility, referrals, etc.):",
    reportingManagerNote:
      'Ravi has been a dependable team member with consistent delivery and clear ownership across assigned work. He coordinated his exit smoothly and supported a structured handover for the team.',
    reportingManagerName: 'Amit Sharma',
    managerFullName: 'Amit Sharma',
    managerRole: 'Reporting Manager',
    managerCompany: 'MetaUpSpace LLP',
    managerSignatureUrl:
      'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
    hrName: 'Miss Shruti Kabra',
    hrRole: 'HR',
    hrCompany: 'MetaUpSpace LLP',
    hrSignatureUrl:
      'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
    employeeDeclaration:
      'I hereby confirm that I have submitted all company assets assigned to me, completed my responsibilities to the best of my knowledge, and have no outstanding obligations towards the organization.',
    hrReviewAndFinalApproval: {
      finalSettlementDate: 'Final settlement to be processed by 05th August, 2025 after document verification',
      eligibleForRehire: 'No',
      hrRemarks:
        'All exit formalities were completed on time. Employee returned assigned assets and completed knowledge transfer. Rehire is currently not recommended for the next 12 months based on business continuity evaluation.',
      financeAndAccounts:
        'Full and final settlement calculation completed, pending payroll release cycle approval and bank processing.',
      reviewedBy: 'Miss Shruti Kabra',
      hrName: 'Miss Shruti Kabra',
    },
    remarks: 'All',
    department: 'Engineering',
    designation: 'Software Engineer',
  },
};