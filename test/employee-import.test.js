import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {
  normalizeDateString,
  parseEmployeeSpreadsheet,
  validateAndProcessImport,
  generateSampleCsvContent,
} from '../lib/employee-import.js';
import {
  CORPORATE_ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
} from '../lib/tenant-auth.js';

test('1. Date normalization helper', () => {
  assert.equal(normalizeDateString('2024-05-12'), '2024-05-12');
  assert.equal(normalizeDateString('15/08/1995'), '1995-08-15');
  assert.equal(normalizeDateString('04-12-1990'), '1990-12-04');
  assert.equal(normalizeDateString(null), null);
  assert.equal(normalizeDateString(''), null);
  assert.equal(normalizeDateString('invalid-date'), null);

  // Excel serial date 44197 -> 2021-01-01
  const excelDate = normalizeDateString(44197);
  assert.equal(typeof excelDate, 'string');
  assert.equal(excelDate.length, 10);
});

test('2. Flexible column mapping and spreadsheet parsing', () => {
  const sampleData = [
    { 'Emp ID': 'EMP101', 'Full Name': 'Priya Sharma', 'Official Email': 'priya@acme.com', Dept: 'Design', 'Joining Date': '2022-03-01', Birthday: '1996-08-20' },
    { 'Employee Code': 'EMP102', 'First Name': 'Rahul', 'Last Name': 'Verma', Email: 'rahul@acme.com', Team: 'Engineering', DOJ: '2021-05-10', DOB: '1992-11-04' },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const parsed = parseEmployeeSpreadsheet(buffer);
  assert.equal(parsed.length, 2);

  // Row 1
  assert.equal(parsed[0].employee_code, 'EMP101');
  assert.equal(parsed[0].first_name, 'Priya');
  assert.equal(parsed[0].last_name, 'Sharma');
  assert.equal(parsed[0].work_email, 'priya@acme.com');
  assert.equal(parsed[0].department, 'Design');
  assert.equal(parsed[0].birthday, '1996-08-20');

  // Row 2
  assert.equal(parsed[1].employee_code, 'EMP102');
  assert.equal(parsed[1].first_name, 'Rahul');
  assert.equal(parsed[1].last_name, 'Verma');
  assert.equal(parsed[1].work_email, 'rahul@acme.com');
  assert.equal(parsed[1].department, 'Engineering');
});

test('3. Import validation, duplicate detection, and safe sync preview', () => {
  const existingDatabaseEmployees = [
    { id: 'db_emp_1', employee_code: 'EMP101', first_name: 'Priya', work_email: 'priya@acme.com' },
  ];

  const uploadRows = [
    // 1. Existing employee EMP101 -> Should be marked for Update
    { employee_code: 'EMP101', first_name: 'Priya', last_name: 'Sharma', work_email: 'priya@acme.com', department: 'Product' },
    // 2. New employee EMP102 -> Should be marked for Create
    { employee_code: 'EMP102', first_name: 'Rahul', last_name: 'Verma', work_email: 'rahul@acme.com', department: 'Engineering' },
    // 3. Duplicate code in upload -> Should be rejected
    { employee_code: 'EMP102', first_name: 'Duplicate', work_email: 'dup@acme.com' },
    // 4. Missing required name -> Should be rejected
    { employee_code: 'EMP103', first_name: '', work_email: 'noname@acme.com' },
    // 5. Invalid email format -> Should be rejected
    { employee_code: 'EMP104', first_name: 'Bad', last_name: 'Email', work_email: 'not-an-email' },
  ];

  const result = validateAndProcessImport(uploadRows, existingDatabaseEmployees);

  assert.equal(result.totalRows, 5);
  assert.equal(result.toUpdateCount, 1);
  assert.equal(result.toCreateCount, 1);
  assert.equal(result.invalidCount, 3);

  // Verify matched update
  assert.equal(result.toUpdate[0].existing_id, 'db_emp_1');
  assert.equal(result.toUpdate[0].updates.department, 'Product');

  // Verify created record
  assert.equal(result.toCreate[0].employee_code, 'EMP102');

  // Verify error details
  assert.equal(result.invalidRows.length, 3);
  assert.equal(result.invalidRows[0].errors[0].includes('Duplicate employee code'), true);
  assert.equal(result.invalidRows[1].errors[0].includes('First name is required'), true);
  assert.equal(result.invalidRows[2].errors[0].includes('Invalid email format'), true);
});

test('4. Sample CSV template generator', () => {
  const csv = generateSampleCsvContent();
  assert.equal(typeof csv, 'string');
  assert.equal(csv.includes('Employee Code'), true);
  assert.equal(csv.includes('Priya'), true);
  assert.equal(csv.includes('EMP001'), true);
});

test('5. Tenant RBAC Permission Matrix', () => {
  // Business Owner permissions
  assert.equal(hasPermission(CORPORATE_ROLES.BUSINESS_OWNER, 'manageSettings'), true);
  assert.equal(hasPermission(CORPORATE_ROLES.BUSINESS_OWNER, 'manageEmployees'), true);
  assert.equal(hasPermission(CORPORATE_ROLES.BUSINESS_OWNER, 'approveExperiences'), true);

  // HR Admin permissions
  assert.equal(hasPermission(CORPORATE_ROLES.HR_ADMIN, 'manageSettings'), false);
  assert.equal(hasPermission(CORPORATE_ROLES.HR_ADMIN, 'manageEmployees'), true);
  assert.equal(hasPermission(CORPORATE_ROLES.HR_ADMIN, 'approveExperiences'), true);

  // HR Operator permissions
  assert.equal(hasPermission(CORPORATE_ROLES.HR_OPERATOR, 'createExperiences'), true);
  assert.equal(hasPermission(CORPORATE_ROLES.HR_OPERATOR, 'approveExperiences'), false);

  // Viewer permissions
  assert.equal(hasPermission(CORPORATE_ROLES.VIEWER, 'viewReports'), true);
  assert.equal(hasPermission(CORPORATE_ROLES.VIEWER, 'manageEmployees'), false);
  assert.equal(hasPermission(CORPORATE_ROLES.VIEWER, 'createExperiences'), false);
});
