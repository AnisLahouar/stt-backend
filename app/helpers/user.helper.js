exports.hasAdminPriviledges = (user) => {
  if (!user) {
    console.log("USER IS NULL")
    return false
  }

  if (user.role == 'admin' || user.role == 'superAdmin') {
    return true
  }

  return false
}