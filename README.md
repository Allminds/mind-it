#AllMinds
AllMinds is an open source tool for creating collaborative mindmaps.


#Requirements

1) Install the latest official Meteor release from your terminal:
	curl https://install.meteor.com/ | sh
	Meteor uses MongoDB as default database.

2) Download the latest version (3.5.6) here:
	http://d3js.org/
	d3.zip

3) Build tool
   Isobuild is built into the Meteor Tool. Builds will be run automatically when you run commands like meteor run or meteor deploy, or can be performed manually with the meteor build command. Isobuild isn't available as a standalone download yet but could be in the future.

 4) Codeship, Countinous Integration tool - setup and test commands
	
	git config --global url."https://".insteadOf git://
	
	Install node.js
	nvm install 0.10.33
	nvm use 0.10.33

	Install Meteor
	curl -o meteor_install_script.sh https://install.meteor.com/
	chmod +x meteor_install_script.sh
	sed -i "s/type sudo >\/dev\/null 2>&1/\ false /g" meteor_install_script.sh
	./meteor_install_script.sh
	export PATH=$PATH:~/.meteor/

	Test Pipelines:
	meteor --test --release velocity:METEOR@1.1.0.3_1

5) Meteor testing tool 
	Velocity Test runner with Jasmine test framework

	Installation
	meteor add sanjo:jasmine
	You also need to install a Velocity Reporter package to see the test results.
	meteor add velocity:html-reporter 

6) Meteor Deployment tool
   http://meteortips.com/deployment-tutorial/

7) Setup following in your ~/.bashrc or ~/.zshrc so that login will work on your local dev machine: 
	1. clientId
	2. secret 
	3. service
	
#Features

Web Based Collaboration for mindmap.
It's free



