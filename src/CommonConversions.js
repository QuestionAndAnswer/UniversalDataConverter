define([
	"UniversalDataConverter/Conversion",
	"UniversalDataConverter/utils"
], function (Conversion, utils) {
	/**
	 * Contains set of default common conversions
	 * @namespace UniversalDataConverter.conversions
	 */
	return {
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
			return new Conversion({
				inPath: sPathToArray + "/[0-9]+$",
				outPath: function (oArgs) {
					return sBaseOutPath + aFieldNamesToIndexBy.map(function (sFieldName) {
						return oArgs.item[sFieldName];
					}).join("/");
				}
			});
		}
	};
});
