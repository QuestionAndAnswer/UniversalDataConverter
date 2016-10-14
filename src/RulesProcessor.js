define([
	"UniversalDataConverter/utils"
], function (utils) {
	function RulesProcessor(aRules) {
		this._rules = aRules;
		this._rules.forEach(function (oRule) {
			oRule.pattern = new RegExp(oRule.pattern);
			oRule.action = oRule.action || function () {};
		});
	};

	/**
	 * Iterates through words and applies actions according rules
	 * @param {string} aWords Array of words to process
	 */
	RulesProcessor.prototype.callMatched = function (aWords) {
		var that = this;
		aWords.forEach(function (sWord) {
			that._rules.forEach(function (oRule) {
				if(oRule.pattern.test(sWord)) {
					oRule.action({
						rule: oRule,
						word: sWord,
						matchedGroups: utils.getMatchedGroups(sWord, oRule.pattern),
					});
				}
			});
		});
	};

	return RulesProcessor;
});
