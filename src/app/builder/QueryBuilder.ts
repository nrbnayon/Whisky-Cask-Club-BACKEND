/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { FilterQuery, Query } from 'mongoose';

export class QueryBuilder<T> {
  public query: Record<string, unknown>; //payload
  public modelQuery: Query<T[], T>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.query = query;
    this.modelQuery = modelQuery;
  }
  search(searchableFields: string[]) {
    let searchTerm = '';

    if (this.query?.searchTerm) {
      searchTerm = this.query.searchTerm as string;
    }

    this.modelQuery = this.modelQuery.find({
      $or: searchableFields.map(
        field =>
          ({
            [field]: new RegExp(searchTerm, 'i'),
          }) as FilterQuery<T>,
      ),
    });
    return this;
  }
  paginate() {
    let limit: number = Number(this.query?.limit || 9999);

    let skip: number = 0;

    if (this.query?.page) {
      const page: number = Number(this.query?.page || 1);
      skip = Number((page - 1) * limit);
    }

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }
  sort(section: string = 'null') {
    let sortBy = '-createdAt';

    if (this.query?.sortBy) {
      sortBy = this.query.sortBy as string;
    }
    this.modelQuery = this.modelQuery.sort(sortBy);
    return this;
  }
  fields() {
    let fields = '';

    if (this.query?.fields) {
      fields = (this.query?.fields as string).split(',').join(' ');
    }

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  filter(regexSafeFields: string[] = []) {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'page', 'limit', 'sortBy', 'fields'];

    if (queryObj.sender && queryObj.receiver) {
      const senderValue = queryObj.sender as string;
      const receiverValue = queryObj.receiver as string;

      const andCondition = {
        $and: [{ sender: senderValue }, { receiver: receiverValue }],
      };

      delete queryObj.sender;
      delete queryObj.receiver;

      Object.assign(queryObj, andCondition);
    } else {
      if (queryObj.sender) {
        queryObj.sender = { $eq: queryObj.sender as string };
      }

      if (queryObj.receiver) {
        queryObj.receiver = { $eq: queryObj.receiver as string };
      }
    }

    excludeFields.forEach(e => delete queryObj[e]);
    Object.keys(queryObj).forEach(key => {
      const value = queryObj[key];
      if (typeof value === 'string' && regexSafeFields.includes(key)) {
        queryObj[key] = { $regex: value, $options: 'i' };
      }
    });
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 9999;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}
