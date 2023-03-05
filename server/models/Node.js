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
		eth0_mac: {
			type: DataTypes.STRING(15)
		},
		eth0_ipv4: {
			type: DataTypes.STRING(17),
			unique: true
		},
		wlan0_mac: {
			type: DataTypes.STRING(15)
		},
		wlan0_ipv4: {
			type: DataTypes.STRING(17),
			unique: true
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