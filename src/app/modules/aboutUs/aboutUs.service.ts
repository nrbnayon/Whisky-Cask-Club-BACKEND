import { TAbout } from './aboutUs.interface';
import { About } from './aboutUs.model';

const createAbout = async (payload: TAbout) => {
  const result = await About.create(payload);

  return result;
};

const getAllAbouts = async () => {
  const result = await About.find();

  return result;
};

const updateAbout = async (payload: TAbout) => {
  const result = await About.findOneAndUpdate(
    {},
    { description: payload.description },
    { new: true },
  );

  return result;
};

export const aboutServices = {
  createAbout,
  updateAbout,
  getAllAbouts,
};
