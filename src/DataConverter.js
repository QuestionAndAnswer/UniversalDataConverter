define([
	"UniversalDataConverter/RulesProcessor",
	"UniversalDataConverter/Conversion",
	"UniversalDataConverter/utils",
	"UniversalDataConverter/ArgsObject"
], function(RulesProcessor, Conversion, utils, ArgsObject) {

	/**
	 * @class DataConverter
	 * @param {object} oArgs Parameters object
 	 * @param {array} oArgs.modifications Conversions.
 	 * This conversion will modify passed object's structure. On this step
 	 * only modification under passed object is performed. All not mentioned in Conversions
 	 * pathes will be transfered to output object untouched.
 	 * @param {array} oArgs.extractions Conversions.
 	 * This conversion will extract object's nodes using conversions. On this step
 	 * only pathes that mentioned in conversion object, pathes under which processing is performing
 	 * will go to the output structure.
 	 * @param {object} oArgs.default Deault output structure
 	 * Set default output structure. This object will be used after last
 	 * conversion to achive default structure. Default value will be applyed
 	 * in all cases. If only modification conversions passed, then default
 	 * will be merged with result of modification conversions. If only
 	 * extraction conversions passed, then default will be merged with
 	 * result of extraction conversions. If both types of conversions were passed,
 	 * then default will be merged with result of full conversion pipeline
 	 * (after modification and extraction conversions).
 	 * @example
 	 * new DataConverter({
 	 *   extractions: { inPath: "/FieldOne" },
 	 *   default: { FieldOne: {}, FieldTwo: ""},
 	 * })
 	 *   .convert({ FieldOne: 123 });
 	 *   //result will be { FieldOne: 123, FieldTwo: ""};
	 */
	function DataConverter(oArgs) {
		this._modifications = this._prepareConversions(oArgs.modifications);
		this._extractions = this._prepareConversions(oArgs.extractions);

		this._modificationsProcessor = this._getModificationProcessor(this._modifications);
		this._extractionsProcessor = this._getExtractionProcessor(this._extractions);

		this._default = oArgs.default;
	}

	/**
	 * Prepare conversions to internal use. Convert types, packing it in arrays,
	 * to make theirs usage uniform.
	 * @param  {object|array} vConversions Conversions
	 * @return {array}  Prepared conversions
	 */
	DataConverter.prototype._prepareConversions = function(vConversions) {
		if(!vConversions) {
			return [];
		}

		var aConversions,
			sRootType = jQuery.type(vConversions),
			sInnerType = jQuery.type(vConversions[0]);

		if (sRootType === "object") {
			aConversions = [
				[vConversions]
			];
		} else if (sRootType === "array" && sInnerType === "object") {
			aConversions = [vConversions];
		} else if (sRootType === "array" && sInnerType === "array") {
			aConversions = vConversions;
		} else {
			throw new Error("UDC: Conversion might be passed as array of passes [[{}, ..., {}], [{}, ..., {}]]," +
				"as array of conversions like single pass [{}, ..., {}], or as object like single conversion {}." +
				"Check that you passing correct values");
		}

		aConversions = aConversions || [];
		//wrap inPath to array and precompile inPathes to RegExp objects
		return aConversions.map(function(aPass) {
			return aPass.map(function(oConversion) {
				return new Conversion(oConversion);
			});
		});
	};

	/**
	 * Pack user defined conversions to RulesProcessor rule form for
	 * Modifications conversions
	 * @param  {array} aConversions Raw user conversions
	 * @return {array}  Array of rule processors. Each RuleProcessor represents single pass.
	 */
	DataConverter.prototype._getModificationProcessor = function(aConversions) {
		var that = this;
		return this._mapToProcessors(aConversions, function (oArgs, oParams, oConversion) {
			if (oConversion.delete) {
				utils.removeByPath(oParams.data, oArgs.word);
			} else {
				that._applyCommonConversion(oConversion, oArgs.word, oParams.value, oArgs.pattern, oParams.data);
			}
		});
	};

	/**
	 * Pack user defined conversions to RulesProcessor rule form for
	 * Extraction conversions
	 * @param  {array} aConversions Raw user conversions
	 * @return {array}  Array of rule processors. Each RuleProcessor represents single pass.
	 */
	DataConverter.prototype._getExtractionProcessor = function(aConversions) {
		var that = this;
		return this._mapToProcessors(aConversions, function (oArgs, oParams, oConversion) {
			that._applyCommonConversion(oConversion, oArgs.word, oParams.value, oArgs.pattern, that._result);
		});
	};

	DataConverter.prototype._mapToProcessors = function (aConversions, fnAction) {
		return aConversions.map(function(aPass) {
			return new RulesProcessor(aPass.map(function (oConversion) {
				return {
					pattern: oConversion.inPath,
					action: function (oArgs, oParams) {
						fnAction(oArgs, oParams, oConversion);
					}
				};
			}));
		});
	};

	DataConverter.prototype._applyCommonConversion = function (oConversion, sCurrentPath, vObjectOnPath, sMatchedPattern, oToSetObject) {
		var oArgsObject = new ArgsObject(sCurrentPath, vObjectOnPath);
		var sOutPath = this._getOutPathAndMatchedGroups(oConversion, sCurrentPath, sMatchedPattern, oArgsObject);
		var vOutValue = this._getOutValue(oConversion, oArgsObject);
		utils.setValByPath(oToSetObject, sOutPath, vOutValue);
	};

	/**
	 * Apply direct conversions to object
	 * <br>
	 * <b>Note: passed object will be modified if modification conversions were passed.</b>
	 * @param  {object} oData Data object for conversion.
	 * @return {object}  Output structure
	 */
	DataConverter.prototype.convert = function(oData) {
		this._applyModifications(oData);
		this._applyExtractions(oData);
		//optimization
		if (this._default) {
			return jQuery.extend(true, {}, this._default, this._result);
		} else {
			return this._result;
		}
	};

	/**
	 * Applies modification conversions under oData object
	 * @param  {object} oData Data object
	 */
	DataConverter.prototype._applyModifications = function(oData) {
		ArgsObject.prototype.data = oData; //sharing current working data copy
		for (var i = 0, convLen = this._modificationsProcessor.length; i < convLen; i++) {
			this._applyPass(oData, this._modificationsProcessor[i]);
		}
	};

	DataConverter.prototype._applyExtractions = function(oData) {
		this._result = oData;
		ArgsObject.prototype.data = oData; //sharing current working data copy
		for (var i = 0, convLen = this._extractionsProcessor.length; i < convLen; i++) {
			var oCurrentData = this._result; //save previouse step processing result as next step input data
			ArgsObject.prototype.data = oCurrentData; //share for next step input data
			this._result = {}; //init new data processing container

			this._applyPass(oCurrentData, this._extractionsProcessor[i]);
		}
	};

	DataConverter.prototype._applyPass = function (oData, aPass) {
		utils.objectWalkInDeep(oData, function(sPath, vVal) {
			aPass.callMatched(sPath, {
				data: oData,
				value: vVal
			});
		});
	};

	DataConverter.prototype._getOutPathAndMatchedGroups = function (oConversion, sPath, sMatchedPath, oArgsObject) {
		if(jQuery.isFunction(oConversion.outPath)) {
			oArgsObject.matchedGroups = utils.getMatchedGroups(sPath, sMatchedPath);
			return oConversion.outPath(oArgsObject);
		} else {
			return sPath.replace(sMatchedPath, oConversion.outPath);
		}
	};

	/**
	 * Get out value using conversion object. If conversion has extend property, then
	 * this outputvalue will be extended with this extension object. Usefull when
	 * there is a need in default value with direct conversion
	 * @param {object} oConversion Conversion object
	 * @param {ArgsObject} oArgsObject Arguments object
	 * @return {any}  Out value
	 */
	DataConverter.prototype._getOutValue = function (oConversion, oArgsObject) {
		var vOutValue = oConversion.outValue(oArgsObject);
		if(oConversion.extendWith) {
			return jQuery.extend(true, {}, oConversion.extendWith, vOutValue);
		} else {
			return vOutValue;
		}
	};

	return DataConverter;
});
