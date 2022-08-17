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
            'Update Employee Role', // incomplete
            'View All Roles', // complete
            'Add Role', // incomplete
            'View All Departments', // complete
            'Add Department', // incomplete
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
    console.log(values);
    const insert = 
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)';
    db.query(insert, values);
    // prompt the user for the next set of inputs
    nextAction();
};

function updateRole() {

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

function addRole() {

};

async function getRoles() {
};

function viewDepartments() {
    db.query('SELECT * FROM department', function(err, results) {
        console.log();
        console.table(results);
        nextAction();
    });
};

function addDepartment() {

};

nextAction();
// viewEmployees();
