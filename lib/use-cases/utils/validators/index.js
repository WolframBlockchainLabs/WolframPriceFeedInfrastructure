import symbol from './symbol.js';
import array_params from './array_params.js';
import date_compare from './date_compare.js';
import iso_timestamp from './iso_timestamp.js';
import not_null from './not_null.js';
import nullable from './nullable.js';
import required_if_present from './required_if_present.js';
import unique_list from './unique_list.js';
import date_greater_then_field from './date_greater_then_field.js';
import date_less_then_field from './date_less_then_field.js';
import nested_object from 'livr/lib/rules/meta/nested_object.js';

const customValidators = {
    symbol,
    array_params,
    date_compare,
    iso_timestamp,
    not_null,
    nullable,
    required_if_present,
    unique_list,
    date_greater_then_field,
    date_less_then_field,
    nested_object,
};

export default customValidators;
