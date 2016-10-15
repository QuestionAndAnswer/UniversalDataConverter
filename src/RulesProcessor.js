define([
	"UniversalDataConverter/utils"
], function (utils) {
	function RulesProcessor(aRules) {
		this._rules = aRules;
		this._rules.forEach(function (oRule) {
			oRule.patterns = utils.wrapInArrayIfNot(oRule.pattern).map(function (oPattern) {
				return new RegExp(oPattern);
			});
			oRule.action = oRule.action || function () {};
		});
	}

	/**
	 * Iterates through words and applies actions according rules
	 * @param {string|array} aWords Array of words to process
	 * @param {any} [vAdditionalData] Additional data that will be
	 * passed to every action method call
	 * @param {array}  Matched rules actions results
	 */
	RulesProcessor.prototype.callMatched = function (vWords, vAdditionalData) {
		var aWords = utils.wrapInArrayIfNot(vWords);
		var oResult = [];

		var that = this;
		aWords.forEach(function (sWord) {
			that._rules.forEach(function (oRule) {
				for(var i = 0; i < oRule.patterns.length; i++) {
					var oPattern = oRule.patterns[i];
					if(oPattern.test(sWord)) {
						var oArgs = {
							rule: oRule,
							word: sWord,
							pattern: oPattern,
							matchedGroups: utils.getMatchedGroups(sWord, oPattern)
						};

						var vActionResult = oRule.action(oArgs, vAdditionalData);

						if(vActionResult !== undefined) {
							oResult.push(vActionResult);
						}
						break;
					}
				}
			});
		});

		return oResult;
	};

	return RulesProcessor;
});
