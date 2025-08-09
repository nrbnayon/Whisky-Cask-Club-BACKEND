import { TPrivacy } from './privacy.interface';
import { Privacy } from './privacy.model';

const createPrivacy = async (payload: TPrivacy) => {
  const result = await Privacy.create(payload);

  return result;
};

const getAllPrivacy = async () => {
  const result = await Privacy.find();

  return result;
};

const updatePrivacy = async (payload: TPrivacy) => {
  const result = await Privacy.findOneAndUpdate(
    {},
    { description: payload.description },
    { new: true },
  );

  return result;
};

export const privacyServices = {
  createPrivacy,
  updatePrivacy,
  getAllPrivacy,
};
