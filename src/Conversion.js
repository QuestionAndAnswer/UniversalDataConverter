(function () {
	/**
	 * Conversion object. Used mostly internally.
	 * @class UDC.Conversion
	 * @param {object} oPattern Conversion object pattern
	 */
	function Conversion(oPattern) {
		this.inPath = oPattern.inPath;
		this.delete = oPattern.delete;
		this.outPath = oPattern.outPath;
		this.outValue = oPattern.outValue;
		this.extendWith = oPattern.extendWith;
		this._toInternalTypes();
	}

	Conversion.prototype._toInternalTypes = function () {
		//wrap single path into array
		var aInPath = utils.wrapInArrayIfNot(this.inPath);
		//regexp conversion. Precomiling regexp, perfomance optimization
		aInPath = aInPath.map(function (vPath) {
			return jQuery.type(vPath) === "regexp" ? vPath : new RegExp(vPath);
		});
		this.inPath = aInPath;
		//provide default outPath function if empty
		this.outPath = this.outPath || function (oArgs) { return oArgs.path; };
		//provide default outValue function if empty
		this.outValue = this.outValue || function (oArgs) { return oArgs.item; };
	};

	Conversion.prototype.extend = function (oPattern) {
		this.inPath = oPattern.inPath || this.inPath;
		this.delete = oPattern.delete || this.delete;
		this.outPath = oPattern.outPath || this.outPath;
		this.outValue =  oPattern.outValue || this.outValue;
		this.extendWith = oPattern.extendWith || this.extendWith;
		this._toInternalTypes();
		return this;
	};

	window.Conversion = Conversion;
})();
