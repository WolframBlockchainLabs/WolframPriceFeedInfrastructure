import cli_string_format from './cli_string_format.js';
import date_greater_than from './date_greater_than.js';
import iso_date from './iso_date.js';
import json from './json.js';

const customValidators = {
    iso_date,
    json,
    date_greater_than,
    cli_string_format,
};

export default customValidators;
