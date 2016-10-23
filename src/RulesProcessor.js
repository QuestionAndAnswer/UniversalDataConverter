define([
	"UniversalDataConverter/utils"
], function (utils) {
	/**
	 * @class RulesProcessor
	 * Passed rules are not deep copyed, so any attached
	 * to rule data (fileds) will stay untouched.
	 * @param {array} [aRules] Array of rules
	 */
	function RulesProcessor(aRules) {
		this._rules = aRules || [];
		this._rules.forEach(this._prepareRule.bind(this));
	}

	/**
	 * Prepare passed rule by converting required fields to
	 * ready to consume form. This need to prevent redundant checks,
	 * and transformations on processing stage
	 * This function call will modify passed object
	 * @param  {object} oRule Rule object
	 * @return {object}  Passed Rule object
	 */
	RulesProcessor.prototype._prepareRule = function (oRule) {
		oRule.patterns = utils.wrapInArrayIfNot(oRule.pattern).map(function (oPattern) {
			return new RegExp(oPattern);
		});
		oRule.action = oRule.action || function () {};
		return oRule;
	};

	/**
	 * Add rule to existing rules list
	 */
	RulesProcessor.prototype.addRule = function (oRule) {
		if(oRule) {
			this._rules.push(this._prepareRule(oRule));
		}
	};

	/**
	 * Remove rule
	 */
	RulesProcessor.prototype.removeRule = function (oRule) {
		var iIndex = this._rules.indexOf(oRule);
		if(iIndex !== -1) {
			this._rules.splice(iIndex, 1);
		}
	};

	/**
	 * Remove rule by name. If name filed presented in rule object
	 * then this matched object will be removed from rules list.
	 * If rule with such name was not find, nothing will be removed
	 */
	RulesProcessor.prototype.removeRuleByName = function (sName) {
		for(var i = 0, len = this._rules.length; i < len; i++) {
			if(this._rules[i].name === sName) {
				this._rules.splice(i, 1);
				break;
			}
		}
	};

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
