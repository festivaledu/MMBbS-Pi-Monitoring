const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Node = sequelize.define("Node", {
		id: {
			type: DataTypes.STRING(36),
			primaryKey: true,
			unique: true,
			allowNull: false
		},
		hostname: {
			type: DataTypes.STRING,
			allowNull: false
		},
		interfaces: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {}
		}
	});

	Node.associate = ({ TemperatureEntry }) => {
		Node.hasMany(TemperatureEntry, {
			foreignKey: "nodeId",
			targetKey: "id",
			onDelete: "CASCADE"
		});
	};

	return Node;
};