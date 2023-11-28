module.exports = (sequelize, DataTypes) => {
    const TemplateForm = sequelize.define("templateForms", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        registrationDetailsFields: {
            type: DataTypes.JSON
        },
        paymentFields: {
            type: DataTypes.JSON
        },
        formCode: {
            type: DataTypes.STRING
        },
        HTMLCode: {
            type: DataTypes.TEXT
        },
        javaScriptCode: {
            type: DataTypes.TEXT
        }
    }, {
        paranoid: true
    });
    return TemplateForm;
};

// adminId
// templateId
// courseId