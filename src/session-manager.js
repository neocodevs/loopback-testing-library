const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());
const configFile = require(`${appDirectory}/loopback-testing.json`);
const { camelize } = require("./utils");

module.exports = (app) => {
  const { fakersFolder, userModel, roles } = configFile;
  const defaultRole = roles ? roles[0] : null;
  const fakers = require(process.cwd() + fakersFolder);
  const userFaker = fakers[camelize(userModel)];

  return {
    getSession,
    addRoleToUser,
  };

  function getSession(props = {}) {
    const user = userFaker(props);
    return app.models[userModel]
      .create(user)
      .then((userInstance) =>
        props.role || defaultRole
          ? addRoleToUser(userInstance.id, props.role || defaultRole)
          : Promise.resolve()
      )
      .then(() => app.models[userModel].login(user));
  }

  function addRoleToUser(userId, role) {
    const { Role, RoleMapping } = app.models;
    return Role.findOne({ where: { name: role } }).then((roleInstance) =>
      RoleMapping.create({
        principalType: RoleMapping.USER,
        principalId: userId,
        roleId: roleInstance.id,
      })
    );
  }
};
