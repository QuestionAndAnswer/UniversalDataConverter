define([
	"UniversalDataConverter/Conversion",
	"UniversalDataConverter/ArgsObject",
	"UniversalDataConverter/utils"
], function(Conversion, ArgsObject, utils) {
	/**
	 * Converter maker
	 */
	function UDC() {
		return new ConverterObject();
	}

	/**
	 * ConverObject class. Internal class for convertion performing
	 */
	function ConverterObject() {
		this._modifications = [];
		this._extractions = [];
		this._config = {};
		this._default;
	}

	/**
	 * Set modification conversions
	 * @param {array} aModificationConversions Conversions.
	 * This conversion will modify passed object's structure. On this step
	 * only modification under passed object is performed. All not mentioned in Conversions
	 * pathes will be transfered to output object untouched.
	 * @return {ConverterObject}  This converter object instance
	 */
	ConverterObject.prototype.mod = function (aModificationConversions) {
		this._modifications = this._toInternalTypes(aModificationConversions || []);
		return this;
	};

	/**
	 * Set extraction conversions
	 * @param {array} aExtractionConversions Conversions.
	 * This conversion will extract object's nodes using conversions. On this step
	 * only pathes that mentioned in conversion object, pathes under which processing is performing
	 * will go to the output structure.
	 * @return {ConverterObject}  This converter object instance
	 */
	ConverterObject.prototype.ext = function (aExtractionConversions) {
		this._extractions = this._toInternalTypes(aExtractionConversions || []);
		return this;
	};

	/**
	 * Set configuration options
	 * @param {object} oConfig Configuration object.
	 * @return {ConverterObject}  This converter object instance
	 */
	ConverterObject.prototype.config = function (oConfig) {
		this._config = oConfig;
		return this;
	};

	/**
	 * Set default output structure. This object will be used after last
	 * conversion to achive default structure. Default value will be applyed
	 * in all cases. If only modification conversions passed, then default
	 * will be merged with result of modification conversions. If only
	 * extraction conversions passed, then default will be merged with
	 * result of extraction conversions. If both types of conversions were passed,
	 * then default will be merged with result of full conversion pipeline
	 * (after modification and extraction conversions).
	 * @example
	 * UDC()
	 *   .ext({ inPath: "/FieldOne" })
	 *   .default({ FieldOne: {}, FieldTwo: ""})
	 *   .convert({ FieldOne: 123 });
	 *   //result will be { FieldOne: 123, FieldTwo: ""};
	 * @return {ConverterObject}  This converter object instance
	 */
	ConverterObject.prototype.default = function (oDefault) {
		this._default = this._default || oDefault;
		return this;
	};


	ConverterObject.prototype._toInternalTypes = function (vConversions) {
		var aConversions,
			sRootType = jQuery.type(vConversions),
			sInnerType = jQuery.type(vConversions[0]);

		if(sRootType === "object") {
			aConversions = [[vConversions]];
		} else if(sRootType === "array" && sInnerType === "object") {
			aConversions = [vConversions];
		} else if(sRootType === "array" && sInnerType === "array"){
			aConversions = vConversions;
		} else {
			throw new Error("UDC: Conversion might be passed as array of passes [[{}, ..., {}], [{}, ..., {}]]," +
				"as array of conversions like single pass [{}, ..., {}], or as object like single conversion {}." +
				"Check that you passing correct values");
		}

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
		//optimization
		if(this._default) {
			return jQuery.extend(true, {}, this._default, this._result);
		} else {
			return this._result;
		}
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
						var sOutPath = that._getOutPathAndMatchedGroups(oConversion, sPath, sMatchedPath, oArgsObject);
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

	ConverterObject.prototype._getOutPathAndMatchedGroups = function (oConversion, sPath, sMatchedPath, oArgsObject) {
		if(jQuery.isFunction(oConversion.outPath)) {
			sPath.replace(sMatchedPath, function () {
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
			return sPath.replace(sMatchedPath, oConversion.outPath);
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
					var sOutPath = that._getOutPathAndMatchedGroups(oConversion, sPath, sMatchedPath, oArgsObject);
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

	return UDC;
});
