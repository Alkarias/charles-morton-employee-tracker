const mysql = require('mysql2');
const inquirer = require('inquirer');

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
            'Quit' // incomplete
        ]
    }
];


function nextAction() {
    inquirer.prompt(actionQuestion).then((response) => {
        switch (response.action) {
            case 'View All Employees':
                break;
            case 'Add Employee':
                break;
            case 'Update Employee Role':
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'Add Role':
                break;
            case 'View All Departments':
                break;
            case 'Add Department':
                break;
            case 'Quit':
                process.exit();
        }
        nextAction();
    });
};

function viewEmployees () {

};

function addEmployee() {

};

function updateRole() {

};

function viewRoles() {
    db.query('SELECT * FROM role', function(err, results) {
        console.table(results);
    });
};

function addRole() {

};

nextAction();