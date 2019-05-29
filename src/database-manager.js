const Promise = require("bluebird");

module.exports = ({
  app,
  dataSources,
  models,
  extraResetModels = [],
  roles
}) => {
  const parsedModels = [
    ...Object.keys(models)
      .filter(key => ["_meta", "User"].indexOf(key) === -1)
      .map(key => ({
        name: key,
        dataSource: models[key].dataSource
      })),
    ...extraResetModels
  ];

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
    }).then(() =>
      roles
        ? app.models.Role.create(roles.map(role => ({ name: role })))
        : Promise.resolve()
    );
  }
};
