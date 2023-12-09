module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("course", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
        },
        subTitle: {
            type: DataTypes.STRING
        },
        categories: {
            type: DataTypes.STRING
        },
        authorName: {
            type: DataTypes.STRING
        },
        authorImageOriginalName: {
            type: DataTypes.STRING
        },
        authorImageCloudId: {
            type: DataTypes.STRING
        },
        authorImageFileName: {
            type: DataTypes.STRING
        },
        authorImagePath: {
            type: DataTypes.STRING(1234)
        },
        courseImageOriginalName: {
            type: DataTypes.STRING
        },
        courseImageFileName: {
            type: DataTypes.STRING
        },
        courseImageCloudId: {
            type: DataTypes.STRING
        },
        courseImagePath: {
            type: DataTypes.STRING(1234)
        },
        BUNNY_VIDEO_LIBRARY_ID: {
            type: DataTypes.STRING
        },
        BUNNY_LIBRARY_API_KEY: {
            type: DataTypes.STRING
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        tag: {
            type: DataTypes.STRING
        },
        courseCode: {
            type: DataTypes.STRING
        },
        price: {
            type: DataTypes.STRING
        },
        currency: {
            type: DataTypes.STRING
        },
        discription: {
            type: DataTypes.TEXT
        },
        authorDiscription: {
            type: DataTypes.TEXT
        },
        allowAffiliate: {
            type: DataTypes.BOOLEAN
        }
    }, {
        paranoid: true
    });
    return Course;
};

// adminId