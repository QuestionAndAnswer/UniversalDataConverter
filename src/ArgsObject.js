define([
], function () {
	/**
	 * @memberof UniversalDataConverter
	 * @class ArgsObject
	 * @param {string} sPath Matched path
	 * @param {anu} vItem Item on this path
	 */
	function ArgsObject(sPath, vItem) {
		this.path = sPath;
		this.item = vItem;
		this.matchedGroups = null;
	}

	ArgsObject.prototype.data = {};

	return ArgsObject;
});
