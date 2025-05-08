const { Property } = require("../../database")

exports.propertyExists = async (id) => {
    const property = await Property.findByPk(id)
    if(property) return true
    else return false
}

