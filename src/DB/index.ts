import colors from 'colors';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';
import { User } from '../app/modules/user/user.model';

const superUser = {
  full_name: config.admin.name,
  role: USER_ROLES.ADMIN,
  email_address: config.admin.email,
  password: config.admin.password,
  phone_number: '',
  verified: true,
  isDeleted: false,
};

const seedAdmin = async () => {
  try {
    const isExistSuperAdmin = await User.findOne({ role: USER_ROLES.ADMIN });

    if (!isExistSuperAdmin) {
      await User.create(superUser);
      logger.info(colors.green('✔ admin created successfully!'));
    } else {
      console.log('Admin already exists.');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

export default seedAdmin;
