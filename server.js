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
            'View All Employees', // incomplete
            'Add Employee', // incomplete
            'Update Employee Role', // incomplete
            'View All Roles', // inccomplete
            'Add Role', // incomplete
            'View All Departments', // incomplete
            'Add Department', // incomplete
            'Quit' // complete
        ]
    }
];

function nextAction() {
    inquirer.prompt(actionQuestion).then((response) => {
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
        }
    });
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

function addEmployee() {

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

function viewDepartments() {

};

function addDepartment() {

};

nextAction();
// viewEmployees();