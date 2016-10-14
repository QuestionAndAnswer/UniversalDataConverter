define([
	"UniversalDataConverter/utils"
], function (utils) {
	function RulesProcessor(aRules) {
		this._rules = aRules;
		this._rules.forEach(function (oRule) {
			oRule.pattern = new RegExp(oRule.pattern);
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
				if(oRule.pattern.test(sWord)) {
					var oArgs = {
						rule: oRule,
						word: sWord,
						matchedGroups: utils.getMatchedGroups(sWord, oRule.pattern)
					};

					var vActionResult = oRule.action(oArgs, vAdditionalData);

					if(vActionResult !== undefined) {
						oResult.push(vActionResult);
					}
				}
			});
		});

		return oResult;
	};

	return RulesProcessor;
});
