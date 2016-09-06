(function() {
	function ArgsObject(sPath, vItem) {
		this.path = sPath;
		this.item = vItem;
		this.matchedGroups = null;
	};

	ArgsObject.prototype.data = {};

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
	};

	function ConverterObject(aModificationConversions, aExtractionConversions, oConfig) {
		this._modifications = this._finilazeConversions(aModificationConversions);
		this._extractions = this._finilazeConversions(aExtractionConversions);
		this._config = oConfig;
	};

	ConverterObject.prototype._finilazeConversions = function (aConversions) {
		aConversions = aConversions || [];
		//wrap inPath to array and precompile inPathes to RegExp objects
		aConversions.forEach(function (aPass) {
			aPass.forEach(function (oConversion) {
				//wrap single path into array
				var aInPath = utils.wrapInArrayIfNot(oConversion.inPath);
				//regexp conversion. Precomiling regexp, perfomance optimization
				aInPath = aInPath.map(function (vPath) {
					return jQuery.type(vPath) === "regexp" ? vPath : new RegExp(vPath);
				});
				oConversion.inPath = aInPath;
				//provide default outPath function if empty
				oConversion.outPath = oConversion.outPath || function (oArgs) { return oArgs.path; };
				//provide default outValue function if empty
				oConversion.outValue = oConversion.outValue || function (oArgs) { return oArgs.item; };
			});
		});
		return aConversions;
	};

	/**
	 * Apply direct conversions to object
	 * <br>
	 * <b>Note: passed object will be modified if modification conversions were passed.</b>
	 * @param  {object} oData Data object for conversion.
	 * @return {object}  Output structure
	 */
	ConverterObject.prototype.convert = function (oData) {
		ArgsObject.prototype.data = oData; //sharing current working data copy
		this._applyModificationConversions(oData);
		this._result = {};
		this._applyExtractionConversions(oData);
		return this._result;
	};

	/**
	 * Applies modification conversions under oData object
	 * @param  {object} oData Data object
	 */
	ConverterObject.prototype._applyModificationConversions = function (oData) {
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
						var vOutValue = oConversion.outValue(oArgsObject);
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
		this._applyExtractionPass(oData, this._extractions[0]);
		ArgsObject.prototype.data = this._result; //sharing current working data copy
		for(var i = 1, len = this._extractions.length; i < len; i++) {
			this._applyExtractionPass(this._result, this._extractions[i]);
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
					var vOutValue = oConversion.outValue(oArgsObject);
					utils.setValByPath(that._result, sOutPath, vOutValue);
				});
			}
		});
	};

	UDC.conversions = {
		/**
		 * delete all matched sPath properties from object
		 * @param  {string|regexp} sPath Regexp to find path
		 * @return {object}  Conversion object
		 */
		DeleteMatchedFields: function (sPath) {
			return {
				inPath: sPath,
				delete: true
			};
		},
		/**
		 * //extract data from all sFieldName fields, and put them directly to theirs parents
		 * @param {string} sFieldName     field name
		 * @param {object} oToExtend Additional conversion parameters if needed
		 * @return {object}  Conversion object
		 */
		MoveToParent: function (sFieldName, oToExtend) {
			return jQuery.extend(true, {
				//extract data from all results fields, and put it directly to parent
				inPath: "(.*[A-z0-9]*)/" + sFieldName + "$",
				//in inPath regex matching groups can be used. They will be applyed to
				//out path if needed.
				outPath: "$1"
			}, oToExtend);
		}
	};

	window.UDC = UDC;
})();
