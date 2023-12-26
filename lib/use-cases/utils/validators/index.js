import date_compare from './date_compare.js';
import iso_timestamp from './iso_timestamp.js';
import not_null from './not_null.js';
import nullable from './nullable.js';
import unique_list from './unique_list.js';
import nested_object from 'livr/lib/rules/meta/nested_object.js';

const customValidators = {
    date_compare,
    iso_timestamp,
    not_null,
    nullable,
    unique_list,
    nested_object,
};

export default customValidators;
