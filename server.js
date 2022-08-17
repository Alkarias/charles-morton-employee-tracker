const mysql = require('mysql2');
const inquirer = require('inquirer');
require('console.table');


const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'destiny',
        database: 'employees_db'
    },
    console.log('Connected to the database')
);

const actionQuestion = [
    {
        type: 'list', 
        message: 'What would you like to do?', 
        name: 'action',
        loop: true,
        choices: [
            'View All Employees', // complete
            'Add Employee', // complete
            'Update Employee Role', // complete
            'View All Roles', // complete
            'Add Role', // complete
            'View All Departments', // complete
            'Add Department', // complete
            'Quit' // complete
        ]
    }
];

async function nextAction() {
    const response = await inquirer.prompt(actionQuestion)
    switch (response.action) {
        case 'View All Employees':
            viewEmployees();
            break;
        case 'Add Employee':
            addEmployee();
            break;
        case 'Update Employee Role':
            updateRole();
            break;
        case 'View All Roles':
            viewRoles();
            break;
        case 'Add Role':
            addRole();
            break;
        case 'View All Departments':
            viewDepartments();
            break;
        case 'Add Department':
            addDepartment();
            break;
        case 'Quit':
            process.exit();
    };
};

function viewEmployees() {
    const query = 
    'SELECT e.id, e.first_name, e.last_name, role.title, '+
    'department.name AS department, role.salary, '+
    'CONCAT(m.first_name, " ", m.last_name) AS manager '+
    'FROM employee e '+
    'INNER JOIN role ON e.role_id = role.id '+
    'INNER JOIN department ON role.department_id = department.id '+
    'LEFT JOIN employee m ON e.manager_id = m.id '+
    'ORDER BY e.id';

    db.query(query, function(err, results) {
        console.log(); // this is just to create a blank space to separate the table
        console.table(results);
        nextAction();
    });
};

async function addEmployee() {
    // get the required options for the list choices
    const roles = await db.promise().query('SELECT title FROM role');
    const managers = await db.promise().query('SELECT CONCAT(first_name, " ", last_name) AS name FROM employee');
    const options = [roles[0].map(role => role.title), managers[0].map(employee => employee.name)];
    options[1].push('None');

    // make the list of questions to ask
    const employeeQuestions = [
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: 'first'
        },
        {
            type: 'input',
            message: "What is the employee's last name?",
            name: 'last'
        },
        {
            type: 'list',
            message: "What is the employee's role?",
            name: 'role',
            choices: options[0]
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            name: 'manager',
            choices: options[1]
        }
    ]
    const response = await inquirer.prompt(employeeQuestions);
    // nextAction();
    // convert the role into the role ID
    const roleId = await db.promise().query('SELECT id FROM role WHERE title = ?', response.role);
    // convert the manager's name into their ID number
    const name = response.manager.split(' ');
    const managerId = await db.promise().query('SELECT id FROM employee WHERE first_name = ? AND last_name = ?', name);
    // insert the new employee into the database
    const values = [response.first, response.last, roleId[0][0].id, managerId[0][0].id];
    const insert = 
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)';
    db.query(insert, values, (err) => {
        err ? console.error(err) : console.log(`Added new employee ${response.first} ${response.last}`);
        nextAction();
    });
};

async function updateRole() {
    const employees = await db.promise().query('SELECT CONCAT(first_name, " ", last_name) name FROM employee');
    const roles = await db.promise().query('SELECT title FROM role');
    const options = roles[0].map(role => role.title);
    const updateQuestions = [
        {
            type: 'list',
            message: "Which employee's role do you want to update?",
            name: 'name',
            choices: employees[0]
        },
        {
            type: 'list',
            message: 'Which role do you want to assign the selected employee?',
            name: 'role',
            choices: options
        }
    ];
    const response = await inquirer.prompt(updateQuestions);
    // convert the name of the employee into their ID number
    const name = response.name.split(' ');
    const employeeId = await db.promise().query('SELECT id FROM employee WHERE first_name = ? AND last_name = ?', name);
    // convert the name of the role into it's ID number
    const roleId = await db.promise().query('SELECT id FROM role WHERE title = ?', response.role);
    const values = [roleId[0][0].id, employeeId[0][0].id];
    db.query('UPDATE employee SET role_id = ? WHERE id = ?', values, err => {
        err ? console.error(err) : console.log(`Updated ${response.name} to have the role ${response.role}`);
        nextAction();
    })
};

function viewRoles() {
    const query =
    'SELECT role.id, title, department.name AS department, salary FROM role '+
    'INNER JOIN department ON department.id = role.department_id '+
    'ORDER BY role.id';
    db.query(query, function(err, results) {
        console.log();
        console.table(results);
        nextAction();
    });
};

async function addRole() {
    const departmentName = await db.promise().query('SELECT name FROM department');
    const roleQuestions = [
        {
            type: 'input',
            message: 'What is the name of the role?',
            name: 'title'
        },
        {
            type: 'input',
            message: 'What is the salary of the role?',
            name: 'salary'
        },
        {
            type: 'list',
            message: 'Which department does the role belong to?',
            name: 'department',
            choices: departmentName[0]
        }
    ];
    const response = await inquirer.prompt(roleQuestions);
    // convert the department name into it's ID
    const departmentId = await db.promise()
    .query('SELECT id FROM department WHERE name = ?', response.department);
    // insert the new role into the database
    const values = [response.title, response.salary, departmentId[0][0].id];
    const insert = 
    'INSERT INTO role (title, salary, department_id) VALUES (?,?,?)';
    db.query(insert, values, err => {
        err ? console.error(err) : console.log(`Added ${response.title} to roles`);
        nextAction();
    });
};

function viewDepartments() {
    db.query('SELECT * FROM department', function(err, results) {
        console.log();
        console.table(results);
        nextAction();
    });
};

async function addDepartment() {
    // ask for the name of the new department
    const departmentQuestions = [
        {
            type: 'input',
            message: 'What is the name of the department?',
            name: 'name'
        }
    ];
    const department = await inquirer.prompt(departmentQuestions);
    // insert the new department into the table
    const name = department.name;
    db.query('INSERT INTO department (name) VALUES (?)', name, (err) => {
        err ? console.error(err) : console.log(`Added ${name} to departments`);
        nextAction();
    })
};

nextAction();
// viewEmployees();
