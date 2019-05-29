module.exports = (app, userModel, defaultRole) => {
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
      .then(userInstance =>
        props.role || defaultRole
          ? addRoleToUser(userInstance.id, props.role || defaultRole)
          : Promise.resolve()
      )
      .then(() => app.models[userModel].login({ ...credentials, ...props }));
  }

  function addRoleToUser(userId, role) {
    const { Role, RoleMapping } = app.models;
    return Role.findOne({ where: { name: role } }).then(roleInstance =>
      RoleMapping.create({
        principalType: RoleMapping.USER,
        principalId: userId,
        roleId: roleInstance.id
      })
    );
  }
};
