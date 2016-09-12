(function () {
	function ArgsObject(sPath, vItem) {
		this.path = sPath;
		this.item = vItem;
		this.matchedGroups = null;
	}

	ArgsObject.prototype.data = {};

	window.ArgsObject = ArgsObject;
})();
