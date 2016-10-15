define([

], function () {
	var module = {
		/**
		 * Index items by key. Use this in case if keys are unique.
		 * @prop {array} aList List of items that should be indexed
		 * @prop {string|function} vKey Poperty name or function which will be used for indexing.
		 * Function prototype: function (oItem, iIndex, aList).
		 * @return {object} Indexed by key list
		 */
		indexBy: function (aList, vKey) {
			var i, len, fnKey, oResult = {};

			if(typeof vKey === "string") {
				fnKey = function (oItem) { return oItem[vKey]; };
			} else {
				fnKey = vKey;
			}

			for(i = 0, len = aList.length; i < len; i++) {
				oResult[fnKey(aList[i], i, aList)] = aList[i];
			}

			return oResult;
		},

		/**
		 * Group array's objects using key
		 * @prop {array} aList List of items that should be grouped
		 * @prop {string|function} vKey Poperty name or function which will be used for grouping.
		 * Function prototype: function (oItem, iIndex, aList).
		 * @return {object} Grouped by key list
		 */
		groupBy: function (aList, vKey) {
			var i, len, fnKey, oResult = {};

			if(typeof vKey === "string") {
				fnKey = function (oItem) { return oItem[vKey]; };
			} else {
				fnKey = vKey;
			}

			for(i = 0, len = aList.length; i < len; i++) {
				var sKey = fnKey(aList[i], i, aList);
				if(oResult[sKey]) {
					oResult[sKey].push(aList[i]);
				} else {
					oResult[sKey] = [aList[i]];
				}
			}

			return oResult;
		},

		/**
		 * Truncate path in slice manner
		 * @method truncatePath
		 * @param {boolean} bAsArray If true, result will be in array form, false return string
		 * @param {string} sPath Path to value in object
		 * @param {number} iFrom Path part number from which path should be used.
		 * If iFrom parameter passed only, then working as truncate parameter.
		 * Truncate parameter may be positive and negative number.
		 * If positive number provided, then path will be truncated
		 * from the left side on iTruncate path's parts.
		 * If negative number provided, then path will be truncated
		 * from the right side on iTruncate path's parts.
		 * @param {number} iTo Path part number to which path string must be truncated.
		 * @return {string|array} Processed path
		 */
		truncatePath: function () {
			var bAsArray, sPath, iFrom, iTo;
			if(typeof arguments[0] === "string") {
				sPath = arguments[0];
				iFrom = arguments[1]; iTo = arguments[2];
			} else {
				bAsArray = arguments[0]; sPath = arguments[1];
				iFrom = arguments[2]; iTo = arguments[3];
			}

			var bIsSlashFirst = sPath[0] === "/";
			var sPathParts = sPath.split("/").slice(bIsSlashFirst ? 1 : 0);

			if(!iTo && iTo !== 0) { //if iTo not passed as argument
				if(iFrom < 0) {
					sPathParts = sPathParts.slice(0, iFrom);
				} else {
					sPathParts = sPathParts.slice(iFrom);
				}
			} else {
				sPathParts = sPathParts.slice(iFrom, iTo);
			}

			if(bAsArray) {
				return sPathParts.length === 1 && sPathParts[0] === "" ? [] : sPathParts;
			} else {
				return (bIsSlashFirst ? "/" : "") + sPathParts.join("/");
			}
		},

		/**
		 * Get path part
		 * @method getPathPart
		 * @param {string} sPath Path from which part is needed
		 * @param {number} iIndex Part index.
		 * If positive value passed, then part iIndex counting from the left side will be returned
		 * If negative value passed, then part iIndex counting from the right side will be returned
		 * @return {string} Path part.
		 */
		getPathPart: function (sPath, iIndex) {
			var aPathParts = module.truncatePath(true, sPath);
			return iIndex >= 0 ? aPathParts[iIndex] : aPathParts[aPathParts.length + iIndex];
		},

		/**
		 * Get value in object using provided path
		 * @method getValByPath
		 * @param {object} oObject Object from which value must be extracted
		 * @param {string} sPath Path to value in object
		 * @param {number} iFrom Path part number from which path should be used.
		 * @param {number} iTo Path part number to which path string must be truncated.
		 * @see {truncatePath} for additional information
		 * @example
		 * var oObject = {
		 *   a: {
		 *     b: "a",
		 *     c: 3
		 *   },
		 *   x: 100
		 * };
		 * getValByPath(oObject, "/a/b", -1); // { b: "a", c: 3}
		 * getValByPath(oObject, "/a/b"); // "a"
		 * @see test/mode/utils.js for more examples
		 * @return {any} Value from object
		 */
		getValByPath: function(oObject, sPath, iFrom, iTo) {
			var sPathParts = module.truncatePath(true, sPath, iFrom, iTo);
			var oCurrentObject = oObject;
			for(var i = 0, len = sPathParts.length; i < len; i++) {
				oCurrentObject = oCurrentObject[sPathParts[i]];
			}

			return oCurrentObject;
		},

		setValByPath: function (oObject, sPath, vVal) {
			var sPathParts = module.truncatePath(true, sPath);
			var oCurrentObject = oObject;
			for(var i = 0, len = sPathParts.length - 1; i < len; i++) {
				if(!oCurrentObject[sPathParts[i]]) {
					oCurrentObject[sPathParts[i]] = {};
				}
				oCurrentObject = oCurrentObject[sPathParts[i]];
			}
			oCurrentObject[module.getLast(sPathParts)] = vVal;

			return oObject;
		},

		removeByPath: function (oObject, sPath, iFrom, iTo) {
			var sPathParts = module.truncatePath(true, sPath, iFrom, iTo);
			var oCurrentObject = oObject;
			for(var i = 0, len = sPathParts.length - 1; i < len; i++) {
				oCurrentObject = oCurrentObject[sPathParts[i]];
			}
			delete oCurrentObject[sPathParts[i]];

			return oObject;
		},

		getLast: function (aList) {
			return aList[aList.length - 1];
		},

		/**
		 * Performs deep walk in object.
		 * @method objectWalkInDeep
		 * @memberof utils
		 * @param  {object} oObject    Object for walking
		 * @param  {utils~objectWalkInDeepCallback} fnCallback Walk callback
		 */
		objectWalkInDeep: function (oObject, fnCallback, sUpperPath) {
			var aKeys, sKey, vVal, sFullPath, i, len;
			if(typeof oObject !== "object") {
				return ;
			}

			if(!sUpperPath) {
				sUpperPath = "";
			}

			aKeys = Object.keys(oObject);
			for(i = 0, len = aKeys.length; i < len; i++) {
				sKey = aKeys[i];
				vVal = oObject[sKey];
				sFullPath = sUpperPath + "/" + sKey;

				module.objectWalkInDeep(vVal, fnCallback, sFullPath);
				fnCallback(sFullPath, vVal, sKey);
			}
		},
		/**
		 * @callback utils~objectWalkInDeepCallback
		 * @param {string} sPath Current path
		 * @param {any} vValue Value under current path
		 * @param {string} sKey Current key
		 */

		/**
		 * Wrap array into array if this value not array already.
		 * @param  {any} vVal Value to wrap
		 * @return {array}  Value wrapped into array
		 */
		wrapInArrayIfNot: function (vVal) {
			return jQuery.isArray(vVal) ? vVal : [vVal];
		},

		/**
		 * Returns matched params from string with regexp comparsion
		 * @param {string} sStr String to test
		 * @param {string|regex} vPattern Regexp expression in which matching groups may be presented
		 * @return {array}  Array of matched groups values. Values placed in array
		 * in order same is they presented in pattern
		 */
		getMatchedGroups: function (sStr, vPattern) {
			var matchedGroups = [];
			sStr.replace(vPattern, function () {
				//capture matchedGroups
				if(arguments.length > 3) {
					for(var i = 1, len = arguments.length - 2; i < len; i++) {
						matchedGroups.push(arguments[i]);
					}
				}
				return "";
			});
			return matchedGroups;
		}
	};

	return module;
});
