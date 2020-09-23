# Issue Tracking System

This is a final project of 6083 Database Course (frontend: React, bootstrap; backend: PHP slim; database: MySQL)   

Design and implement a web-based issue tracking system similar to Jira. It allows members to create projects, report issues/bugs for projects, assign the issue to certain people for fixing, and change the status of issues in the workflow. 
- User can sign up for the system by providing an email, username, display name, and password. Users can create projects. 
- Project has a suitable name, a short description, a few project leads and several tasks.
- Issue is a kind of task. Each issue has its title and description, and belongs to a certain project. 
- Once an issue is reported, it goes through several steps to be processed. The life cycle of an issue is called “workflow”. 
- Workflow is indicated by status, such as OPEN, REVIEW, TEST, CLOSE, etc.
             	      	    

1. Designed and implemented a full-stack web application, features include a fully functioned authentication system using JWT. 
2. Designed and implemented complete data models for relational database.
3. Implemented frontend application using React and bootstrap. 
To start front end user interface, run: `npm install`to update packet, and then `npm start` 
4. Implemented backend REST service using PHP and slim framework. 
To start backend server, run: `composer update` to update packet, and then `php -S 127.0.0.1:8000 -t public` 

