import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { INewsLetter } from './newsLetter.interface';
import { NewsLetter } from './newsLetter.model';

const createNewsLetter = async (payload: INewsLetter) => {
  const existingNewsLetter = await NewsLetter.findOne({ email: payload.email });
  if (existingNewsLetter) {
    throw new Error('Email already subscribed to the newsletter');
  }
  const newsLetter = await NewsLetter.create(payload);
  if (!newsLetter) {
    throw new Error('Failed to create newsletter subscription');
  }

  const sendCongrateMail = emailTemplate.newsLetter({
    email: payload.email,
    name: payload.name,
  });

  emailHelper.sendEmail(sendCongrateMail);

  return newsLetter;
};

const getAllNewsLetters = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await NewsLetter.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await NewsLetter.countDocuments();

  return {
    result,
    totalData: count,
    page: pages,
    limit: size,
  };
};

export const NewsLetterService = {
  createNewsLetter,
  getAllNewsLetters,
};
