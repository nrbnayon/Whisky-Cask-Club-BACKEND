import { TSetting } from './setting.interface';
import { Setting } from './setting.model';

const createSetting = async (payload: TSetting) => {
  const result = await Setting.create(payload);

  return result;
};

const getAllSetting = async () => {
  const result = await Setting.find();

  return result;
};

const updateSetting = async (payload: TSetting) => {
  const result = await Setting.findOneAndUpdate(
    {},
    { description: payload.description },
    { new: true },
  );

  return result;
};

export const settingServices = {
  createSetting,
  updateSetting,
  getAllSetting,
};
