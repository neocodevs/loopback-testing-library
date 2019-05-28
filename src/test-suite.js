const fs = require("fs");
const Promise = require("bluebird");

const appDirectory = fs.realpathSync(process.cwd());
const configFile = require(`${appDirectory}/loopback-testing.json`);
const modelConfigFile = require(`${appDirectory}/server/model-config.json`);
const SessionManager = require("./session-manager");
const DatabaseManager = require("./database-manager");

const TestSuite = app => {
  const databaseManager = DatabaseManager(
    app,
    configFile.dataSources,
    modelConfigFile
  );
  const managedSession = SessionManager(app, configFile.userModel);
  const fakers = require(process.cwd() + configFile.fakersFolder);

  if (!app) {
    throw new Error(
      "You must pass the app object as the first and only argument"
    );
  }

  return {
    resetDB: databaseManager.reset,
    getSession: managedSession.getSession,
    resetDBAndGetSession,
    seedDB,
    fakers,
    addRoleToUser: managedSession.addRoleToUser
  };

  function resetDBAndGetSession(props) {
    return databaseManager.reset().then(() => managedSession.getSession(props));
  }

  function seedDB(settings) {
    return Promise.map(settings, setting => seed(setting));
  }

  function seed({ model, props = {}, count = 1 }) {
    const modelClass = app.models[model];
    if (typeof modelClass === "undefined") {
      throw new Error("The provided model does not exist");
    }

    const faker = fakers[camelize(model)];
    const times = [...Array(count)];

    return modelClass.create(times.map(() => faker(props)));
  }

  function camelize(str) {
    return str.charAt(0).toLowerCase() + str.substr(1, str.length);
  }
};

module.exports = TestSuite;