const Promise = require("bluebird");
module.exports = (app, dataSources, models) => {
  const parsedModels = Object.keys(models)
    .filter(key => ["_meta", "User"].indexOf(key) === -1)
    .map(key => ({
      name: key,
      dataSource: models[key].dataSource
    }));

  return {
    reset
  };

  function reset() {
    return Promise.map(dataSources, dataSource => {
      return new Promise((resolve, reject) => {
        app.dataSources[dataSource].automigrate(
          parsedModels
            .filter(model => model.dataSource === dataSource)
            .map(({ name }) => name),
          err => {
            err ? reject(err) : resolve();
          }
        );
      });
    });
  }
};
