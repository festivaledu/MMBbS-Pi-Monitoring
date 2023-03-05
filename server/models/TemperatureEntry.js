const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const TemperatureEntry = sequelize.define("TemperatureEntry", {
		id: {
			type: DataTypes.STRING(36),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		temperature: {
			type: DataTypes.FLOAT
		},
		humidity: {
			type: DataTypes.FLOAT
		},
		nodeId: {
			type: DataTypes.STRING(36),
			references: {
				model: "Nodes",
				key: "id"
			}
		}
	});

	TemperatureEntry.associate = ({ Node }) => {
		TemperatureEntry.belongsTo(Node, {
			foreignKey: "nodeId",
			targetKey: "id",
			onDelete: "CASCADE"
		});
	};

	return TemperatureEntry;
};