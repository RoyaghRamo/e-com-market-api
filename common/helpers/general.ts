import { BadRequestException } from '@nestjs/common';
import {
  Equal,
  FindOptionsOrder,
  FindOptionsWhere,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

export function prepareFilterAndSortField<T>(
  validFilteringField: string[],
  validSortingFields: string[],
  filter: string,
  sort: string,
) {
  const queryFilterFields =
    filter && filter.length > 0 ? filter.replace(' ', '').split(',') : [];
  const filterFields: FindOptionsWhere<T> = {};
  const filterRegexp = /^([a-zA-Z]+)([><=!]+)(.+)$/;
  for (let i = 0; i < queryFilterFields.length; i++) {
    const matchedFilter = queryFilterFields[i].match(filterRegexp);
    const [, field, operator, value] = matchedFilter;

    if (!validFilteringField.includes(field)) {
      throw new BadRequestException('Invalid field in filter query param');
    }

    switch (operator) {
      case '>=':
        filterFields[field] = MoreThanOrEqual(value);
        break;
      case '<=':
        filterFields[field] = LessThanOrEqual(value);
        break;
      case '>':
        filterFields[field] = MoreThan(value);
        break;
      case '<':
        filterFields[field] = LessThan(value);
        break;
      case '=':
        filterFields[field] = Equal(value);
        break;
      case '!=':
        filterFields[field] = Not(value);
        break;
      default:
        throw new BadRequestException('Invalid Operator in filter query');
    }
  }

  const querySortFields =
    sort && sort.length > 0 ? sort.replace(' ', '').split(',') : [];
  const sortFields: FindOptionsOrder<T> = {};

  for (let i = 0; i < querySortFields.length; i++) {
    if (querySortFields[i].charAt(0) === '-') {
      if (!validSortingFields.includes(querySortFields[i].substring(1))) {
        throw new BadRequestException(
          'Invalid order query param! Given values does not exist',
        );
      }
      sortFields[`${querySortFields[i].substring(1)}`] = 'DESC';
    } else {
      sortFields[`${querySortFields[i]}`] = 'ASC';
    }
  }

  return {
    filterFields,
    sortFields,
  };
}
