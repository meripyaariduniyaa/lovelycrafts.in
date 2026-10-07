import * as XLSX from 'xlsx';

export function normalizeDateString(val) {
  if (!val) return null;
  if (typeof val === 'number') {
    // Excel serial date to JS date (1900 date system)
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  const str = String(val).trim();
  if (!str) return null;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Attempt generic JS date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

export function parseEmployeeSpreadsheet(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return rawRows.map((row) => {
    // Find matching keys case-insensitively
    const getVal = (...possibleKeys) => {
      for (const k of Object.keys(row)) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '_');
        for (const pk of possibleKeys) {
          if (cleanK === pk || cleanK.includes(pk)) {
            return String(row[k] || '').trim();
          }
        }
      }
      return '';
    };

    const employeeCode = getVal('employee_code', 'emp_id', 'employee_id', 'code', 'emp_code');
    let firstName = getVal('first_name', 'fname', 'name', 'full_name');
    let lastName = getVal('last_name', 'lname', 'surname');

    // If only full_name was provided, split it
    if (firstName && !lastName && firstName.includes(' ')) {
      const parts = firstName.split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }

    const workEmail = getVal('work_email', 'email', 'business_email', 'official_email').toLowerCase();
    const department = getVal('department', 'dept', 'team', 'division') || 'General';
    const designation = getVal('designation', 'role', 'title', 'position') || 'Team Member';
    const rawDoj = getVal('date_of_joining', 'joining_date', 'doj', 'hire_date', 'start_date');
    const rawDob = getVal('birthday', 'dob', 'birth_date', 'date_of_birth');
    const manager = getVal('manager', 'reporting_manager', 'lead');

    return {
      employee_code: employeeCode,
      first_name: firstName,
      last_name: lastName,
      work_email: workEmail,
      department,
      designation,
      date_of_joining: normalizeDateString(rawDoj),
      birthday: normalizeDateString(rawDob),
      manager: manager || null,
      raw_dob: rawDob,
      raw_doj: rawDoj,
    };
  });
}

export function validateAndProcessImport(parsedRows, existingEmployees = []) {
  const validRows = [];
  const invalidRows = [];
  const toCreate = [];
  const toUpdate = [];

  const seenCodes = new Set();
  const seenEmails = new Set();

  const existingByCode = new Map();
  const existingByEmail = new Map();

  existingEmployees.forEach((emp) => {
    if (emp.employee_code) existingByCode.set(String(emp.employee_code).toUpperCase(), emp);
    if (emp.work_email) existingByEmail.set(String(emp.work_email).toLowerCase(), emp);
  });

  parsedRows.forEach((row, index) => {
    const rowNum = index + 2; // spreadsheet 1-indexed header + 1
    const errors = [];

    if (!row.first_name) {
      errors.push('First name is required.');
    }

    if (!row.employee_code && !row.work_email) {
      errors.push('Either Employee Code or Work Email is required for matching.');
    }

    if (row.work_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.work_email)) {
        errors.push('Invalid email format.');
      }
    }

    // Check duplicate inside this upload
    const codeKey = row.employee_code ? String(row.employee_code).toUpperCase() : null;
    const emailKey = row.work_email ? String(row.work_email).toLowerCase() : null;

    if (codeKey && seenCodes.has(codeKey)) {
      errors.push(`Duplicate employee code "${row.employee_code}" in upload.`);
    }
    if (emailKey && seenEmails.has(emailKey)) {
      errors.push(`Duplicate work email "${row.work_email}" in upload.`);
    }

    if (codeKey) seenCodes.add(codeKey);
    if (emailKey) seenEmails.add(emailKey);

    if (errors.length > 0) {
      invalidRows.push({
        rowNumber: rowNum,
        data: row,
        errors,
      });
      return;
    }

    // Match against existing database records
    let matchedEmp = null;
    if (codeKey && existingByCode.has(codeKey)) {
      matchedEmp = existingByCode.get(codeKey);
    } else if (emailKey && existingByEmail.has(emailKey)) {
      matchedEmp = existingByEmail.get(emailKey);
    }

    const processedRow = {
      ...row,
      status: 'active',
    };

    if (matchedEmp) {
      toUpdate.push({
        existing_id: matchedEmp.id,
        updates: processedRow,
        previous: matchedEmp,
      });
    } else {
      toCreate.push(processedRow);
    }

    validRows.push(processedRow);
  });

  return {
    totalRows: parsedRows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    toCreateCount: toCreate.length,
    toUpdateCount: toUpdate.length,
    toCreate,
    toUpdate,
    invalidRows,
  };
}

export function generateSampleCsvContent() {
  const headers = [
    'Employee Code',
    'First Name',
    'Last Name',
    'Work Email',
    'Department',
    'Designation',
    'Date of Joining (YYYY-MM-DD)',
    'Birthday (YYYY-MM-DD)',
    'Manager',
  ];

  const sampleRows = [
    ['EMP001', 'Priya', 'Sharma', 'priya.sharma@acme.com', 'Engineering', 'Senior Frontend Engineer', '2022-04-15', '1996-08-24', 'Vikram Mehta'],
    ['EMP002', 'Rahul', 'Verma', 'rahul.verma@acme.com', 'Product', 'Principal Product Manager', '2021-02-01', '1993-11-12', 'Aditi Rao'],
    ['EMP003', 'Ananya', 'Deshmukh', 'ananya.d@acme.com', 'Design', 'Lead UI/UX Designer', '2023-06-10', '1998-03-05', 'Vikram Mehta'],
    ['EMP004', 'Karan', 'Malhotra', 'karan.m@acme.com', 'Marketing', 'Growth Marketing Lead', '2020-09-18', '1994-07-30', 'Aditi Rao'],
  ];

  return [
    headers.join(','),
    ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(',')),
  ].join('\n');
}
