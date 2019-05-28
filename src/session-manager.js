module.exports = (app, userModel) => {
  const credentials = {
    email: "xavitb3@gmail.com",
    name: "Xavi Tristancho",
    password: "123456"
  };

  return {
    getSession,
    addRoleToUser
  };

  function getSession(props = {}) {
    return app.models[userModel]
      .create({
        ...credentials,
        ...props
      })
      .then(() => app.models[userModel].login({ ...credentials, ...props }));
  }

  function addRoleToUser(userId, role) {
    const { Role, RoleMapping } = app.models;
    return Role.findOne({ where: { name: role } }).then(role =>
      RoleMapping.create({
        principalType: RoleMapping.USER,
        principalId: userId,
        roleId: role.id
      })
    );
  }
};
