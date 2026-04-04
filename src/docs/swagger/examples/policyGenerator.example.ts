import {
  POLICY_ANNEXURE_DEFAULT_PAYLOAD,
  POLICY_ANNEXURE_M_DEFAULT,
  POLICY_ANNEXURE_N_DEFAULT,
} from '../../../modules/document/config/policyAnnexure.config.ts';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const payload = clone(POLICY_ANNEXURE_DEFAULT_PAYLOAD);
const annexures = Array.isArray(payload.annexures) ? payload.annexures : [];

if (!annexures.some((annexure) => String(annexure?.annexureId).toUpperCase() === 'M')) {
  annexures.push(clone(POLICY_ANNEXURE_M_DEFAULT));
}

if (!annexures.some((annexure) => String(annexure?.annexureId).toUpperCase() === 'N')) {
  annexures.push(clone(POLICY_ANNEXURE_N_DEFAULT));
}

const annexureN = annexures.find((annexure) => String(annexure?.annexureId).toUpperCase() === 'N');
if (annexureN && Array.isArray(annexureN.blocks)) {
  const signatureBlock = annexureN.blocks.find((block) => block.text === '<ACK_SIGNATURE_BLOCK>');
  if (signatureBlock) {
    signatureBlock.signatureBlock = {
      left: {
        signatureLabel: 'Signature:',
        signatureImageUrl:
          'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
        name: 'Mr. Sahil Jaiswal',
        title: 'Chief Executive Officer, MetaUpSpace LLP',
        date: '03 April 2026',
      },
      right: {
        signatureLabel: 'Signature:',
        signatureImageUrl:
          'https://res.cloudinary.com/dkstzpumx/image/upload/q_auto/f_auto/v1775112240/sign_1_rzfa4e.jpg',
        name: 'Employee Name',
        title: 'Employee Title',
        date: '03 April 2026',
      },
    };
  }
}

payload.annexures = annexures;

export const policyGeneratorExample = {
  payload,
};
