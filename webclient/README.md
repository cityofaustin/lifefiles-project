Webclient
=====================

A little intro for webclient.

This project is layed out in a developer friendly way. New features can be added to the features folder. Please observe the current structure where a folder is created for feature name which contains the html,js and less files for that feature.

App Boot Process
-------------------
When the index.html file loads it calls the js/mypass.js file to start the process.
The Gulp file builds the js modules a specific way...see Web_JS in gulpfile.js
This ordering ensures the modules load correctly.
See each js file for notes.

    'webclient/js/mypass.js',
    'webclient/js/config.js',
    'webclient/js/cache.js',
    'webclient/js/session.js',
    'webclient/js/datacontext.js',
    'webclient/js/navigation.js',
    'webclient/js/validation.js',
    'webclient/js/formhelper.js',
    'webclient/js/utils.js',
    'webclient/ui/**/*.js',
    'webclient/js/appboot.js'

Creating new features
---------------------------

Once a new feature has been added it needs to register its self with the main container mypass.js.
Take for instance the following scenario.
An admin user logs in and mypass sends them to their dashboad.
> Note that the ui and server should check the user's role to ensure proper access.

mypass.goto.admindashboard();

The mypass module fetches the ui template then calls the module load method to initial the module js code.
In this case dashboardLoad would get called. In the registerFeature call we also connect any public facing methods the module exposes to the admindashboard feature. This allows for mypass.admindashboard.showServiceProviders() to be called in the admindashboard ui.

  mypass.registerFeature({
    name: 'admindashboard',
    url: '/ui/features/admin/dashboard/index.html',
    load: dashboardLoad,
    methods: {
      showInfo: showInfo,
      showServiceProviders: showServiceProviders,
      showAgents: showAgents,
      showMain:showMain
    }
  });

See existing features for examples.