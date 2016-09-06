(function() {
	function ArgsObject(sPath, vItem) {
		this.path = sPath;
		this.item = vItem;
		this.matchedGroups = null;
	}

	ArgsObject.prototype.data = {};

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

	/**
	 * Converter maker
	 * @param {array} aModificationConversions Conversions.
	 * This conversion will modify passed object's structure. On this step
	 * only modification under passed object is performed. All not mentioned in Conversions
	 * pathes will be transfered to output object untouched.
	 * @param {array} aExtractionConversions Conversions.
	 * This conversion will extract object's nodes using conversions. On this step
	 * only pathes that mentioned in conversion object, pathes under which processing is performing
	 * will go to the output structure.
	 * @param {object} oConfig Configuration object.
	 * @param {object} oConfig.customTypes Specifies custom types for conversions.
	 */
	function UDC(aModificationConversions, aExtractionConversions, oConfig) {
		return new ConverterObject(aModificationConversions, aExtractionConversions, oConfig);
	}

	/**
	 * ConverObject class. Internal class for convertion performing
	 * @param {array} aModificationConversions Modification conversions
	 * @param {array} aExtractionConversions Extraction conversions
	 * @param {object} oConfig Configuration object
	 */
	function ConverterObject(aModificationConversions, aExtractionConversions, oConfig) {
		this._modifications = this._toInternalTypes(aModificationConversions);
		this._extractions = this._toInternalTypes(aExtractionConversions);
		this._config = oConfig;
	}

	ConverterObject.prototype._toInternalTypes = function (aConversions) {
		aConversions = aConversions || [];
		//wrap inPath to array and precompile inPathes to RegExp objects
		return aConversions.map(function (aPass) {
			return aPass.map(function (oConversion) {
				return new Conversion(oConversion);
			});
		});
	};

	/**
	 * Apply direct conversions to object
	 * <br>
	 * <b>Note: passed object will be modified if modification conversions were passed.</b>
	 * @param  {object} oData Data object for conversion.
	 * @return {object}  Output structure
	 */
	ConverterObject.prototype.convert = function (oData) {
		this._applyModificationConversions(oData);
		this._applyExtractionConversions(oData);
		return this._result;
	};

	/**
	 * Applies modification conversions under oData object
	 * @param  {object} oData Data object
	 */
	ConverterObject.prototype._applyModificationConversions = function (oData) {
		ArgsObject.prototype.data = oData; //sharing current working data copy
		for(var i = 0, len = this._modifications.length; i < len; i++) {
			this._applyModificationPass(oData, this._modifications[i]);
		}
	};

	ConverterObject.prototype._applyModificationPass = function (oData, aPass) {
		var that = this;
		utils.objectWalkInDeep(oData, function (sPath, vVal, sKey) {
			for(var i = 0, len = aPass.length; i < len; i++) {
				var oConversion = aPass[i];
				that._forEachMatchedPath(oConversion, sPath, function (sMatchedPath) {
					if(oConversion.delete) {
						utils.removeByPath(oData, sPath);
					} else {
						var oArgsObject = new ArgsObject(sPath, vVal);
						var sOutPath = that._getOutPathAndMatchedGroups(oConversion, sPath, oArgsObject);
						var vOutValue = that._getOutValue(oConversion, oArgsObject);
						utils.setValByPath(oData, sOutPath, vOutValue);
					}
				});
			}
		});
	};

	/**
	 * Iterates through matching pathes
	 * @param  {object}  oConversion Conversion object
	 * @param  {string}  sPath       Path to check
	 * @param  {ConverterObject~MatchedPathCallback}  fnCallback Callback
	 */
	ConverterObject.prototype._forEachMatchedPath = function (oConversion, sPath, fnCallback) {
		for(var i = 0, len = oConversion.inPath.length; i < len; i++) {
			if(oConversion.inPath[i].test(sPath)) {
				fnCallback(oConversion.inPath[i], i);
			}
		}
	};
	/**
	 * @callback ConverterObject~MatchedPathCallback
	 * @param {string} sPath Matched path
	 * @param {number} iIndex Matched path index in inPath property of Conversion object
	 */

	ConverterObject.prototype._getOutPathAndMatchedGroups = function (oConversion, sPath, oArgsObject) {
		if(jQuery.isFunction(oConversion.outPath)) {
			sPath.replace(oConversion.inPath[0], function () {
				//capture matchedGroups
				if(arguments.length > 3) {
					oArgsObject.matchedGroups = [];
					for(var i = 1, len = arguments.length - 2; i < len; i++) {
						oArgsObject.matchedGroups.push(arguments[i]);
					}
				}
				return "";
			});
			return oConversion.outPath(oArgsObject);
		} else {
			return sPath.replace(oConversion.inPath[0], oConversion.outPath);
		}
	};

	ConverterObject.prototype._applyExtractionConversions = function (oData) {
		this._result = oData;
		for(var i = 0, len = this._extractions.length; i < len; i++) {
			oCurrentData = this._result; //save previouse step processing result as next step input data
			ArgsObject.prototype.data = oCurrentData; //share for next step input data
			this._result = {}; //init new data processing container
			this._applyExtractionPass(oCurrentData, this._extractions[i]);
		}
	};

	ConverterObject.prototype._applyExtractionPass = function (oData, aPass) {
		var that = this;
		utils.objectWalkInDeep(oData, function (sPath, vVal, sKey) {
			for(var i = 0, len = aPass.length; i < len; i++) {
				var oConversion = aPass[i];
				that._forEachMatchedPath(oConversion, sPath, function (sMatchedPath) {
					var oArgsObject = new ArgsObject(sPath, vVal);
					var sOutPath = that._getOutPathAndMatchedGroups(oConversion, sPath, oArgsObject);
					var vOutValue = that._getOutValue(oConversion, oArgsObject);
					utils.setValByPath(that._result, sOutPath, vOutValue);
				});
			}
		});
	};

	/**
	 * Get out value using conversion object. If conversion has extend property, then
	 * this outputvalue will be extended with this extension object. Usefull when
	 * there is a need in default value with direct conversion
	 * @param {object} oConversion Conversion object
	 * @param {ArgsObject} oArgsObject Arguments object
	 * @return {any}  Out value
	 */
	ConverterObject.prototype._getOutValue = function (oConversion, oArgsObject) {
		var vOutValue = oConversion.outValue(oArgsObject);
		if(oConversion.extendWith) {
			return jQuery.extend(true, {}, oConversion.extendWith, vOutValue);
		} else {
			return vOutValue;
		}
	};

	/**
	 * Contains set of default common conversions
	 * @namespace UDC.conversions
	 */
	UDC.conversions = {
		/**
		 * delete all matched sPath properties from object
		 * @param  {string|regexp} sPath Regexp to find path
		 * @return {Conversion}  Conversion object
		 */
		DeleteMatchedFields: function (sPath) {
			return new Conversion({
				inPath: sPath,
				delete: true
			});
		},
		/**
		 * //extract data from all sFieldName fields, and put them directly to theirs parents
		 * @param {string} sFieldName field name
		 * @return {Conversion}  Conversion object
		 */
		MoveToParent: function (sFieldName) {
			return new Conversion({
				//extract data from all results fields, and put it directly to parent
				inPath: "(.*[A-z0-9]*)/" + sFieldName + "$",
				//in inPath regex matching groups can be used. They will be applyed to
				//out path if needed.
				outPath: "$1"
			});
		},

		/**
		 * [IndexBy description]
		 * @param {string} sPathToArray Path to array
		 * @param {string} sBaseOutPath Base output path
		 * @param {array|string} vFieldNamesToIndexBy Fields name for indexing
		 * @return {Conversion}  Conversion object
		 */
		IndexBy: function (sPathToArray, sBaseOutPath, vFieldNamesToIndexBy) {
			var aFieldNamesToIndexBy = utils.wrapInArrayIfNot(vFieldNamesToIndexBy);
			var aOutPath = sBaseOutPath === "/" ? "" : sBaseOutPath;
			return new Conversion({
				inPath: sPathToArray + "/[0-9]+$",
				outPath: function (oArgs) {
					return sBaseOutPath + aFieldNamesToIndexBy.map(function (sFieldName) {
						return "/" + oArgs.item[sFieldName];
					});
				}
			});
		}
	};

	window.UDC = UDC;
})();
