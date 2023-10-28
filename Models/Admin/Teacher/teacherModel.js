module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define("teachers", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        mobileNumber: {
            type: DataTypes.STRING,
        },
    }, {
        paranoid: true
    });
    return Teacher;
};

// foriegn key
// adminId