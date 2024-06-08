import { Document, Query } from 'mongoose';

export default class APIFeatures<T extends Document> {
  private query: Query<T[], T>;
  private queryString: Record<string, any>;
  private fields: string[];

  private page: number;
  private limit: number;
  private skip: number;

  constructor(
    query: Query<T[], T>,
    queryString: Record<string, any>,
    fields: string[],
  ) {
    this.query = query;
    this.queryString = queryString;
    this.fields = fields;
    this.page = 1;
    this.limit = 100;
    this.skip = 0;
    this.setPaginationDefault();
  }

  private setPaginationDefault() {
    this.page = parseInt(this.queryString.page) || 1;
    this.limit = parseInt(this.queryString.limit) || 100;
    this.skip = (this.page - 1) * this.limit;
  }

  filter() {
    const queryFields: Record<string, any> = {};

    this.fields.forEach((field) => {
      if (this.queryString[field]) {
        queryFields[field] = this.queryString[field];
      }
    });

    if (Object.keys(queryFields).length) {
      let fieldsStr = JSON.stringify(queryFields);
      fieldsStr = fieldsStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`,
      );
      this.query = this.query.find(JSON.parse(fieldsStr));
    } else {
      this.query = this.query.find({});
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    this.query = this.query.skip(this.skip).limit(this.limit);
    return this;
  }

  async getResults() {
    const totalDocs = await this.query.model.countDocuments();
    if (this.skip >= totalDocs) {
      throw new Error('This page does not exist');
    }

    const results = await this.query;
    return {
      data: results,
      page: this.page,
      limit: this.limit,
      totalPages: Math.ceil(totalDocs / this.limit),
      resultsLength: results.length,
    };
  }
}
