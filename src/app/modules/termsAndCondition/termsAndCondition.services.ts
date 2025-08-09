import { TTermsCondition } from './termsAndCondition.interface';
import { TermsCondition } from './termsAndCondition.model';

const createTermsCondition = async (payload: TTermsCondition) => {
  const result = await TermsCondition.create(payload);

  return result;
};

const getTermsCondinton = async () => {
  const result = await TermsCondition.find();

  return result;
};

const updateTermsCondition = async (payload: TTermsCondition) => {
  const result = await TermsCondition.findOneAndUpdate(
    {},
    { description: payload.description },
    { new: true },
  );

  return result;
};

export const termsConditionServices = {
  createTermsCondition,
  updateTermsCondition,
  getTermsCondinton,
};
