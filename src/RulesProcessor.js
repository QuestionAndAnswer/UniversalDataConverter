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
		oRule.enabled = oRule.enabed || true;
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
	 * @param {object|string} vRule Rule to delete. If string passed,
	 * then search will be performed by name field of rule. If object
	 * passed, then search will be performed by object. If nothing were
	 * oassed as argument, nothing will be deleted
	 */
	RulesProcessor.prototype.removeRule = function (vRule) {
		if(!vRule) {
			return;
		}

		if(typeof vRule === "object") {
			var oRule = vRule;
			var iIndex = this._rules.indexOf(oRule);
			if(iIndex !== -1) {
				this._rules.splice(iIndex, 1);
			}
		} else {
			var sName = vRule;
			for(var i = 0, len = this._rules.length; i < len; i++) {
				if(this._rules[i].name === sName) {
					this._rules.splice(i, 1);
					break;
				}
			}
		}
	};

	function find(aList, fnCallback) {
		for(var i = 0; i < aList.length; i++) {
			var oObj = aList[i];
			if(fnCallback(oObj)) {
				return oObj;
			}
		}
	}

	/**
	 * Enables all rules
	 */
	RulesProcessor.prototype.enableAllRules = function () {
		this._rules.forEach(function (oRule) { return oRule.enabled = true; });
	};

	/**
	 * Disables all rules
	 */
	RulesProcessor.prototype.disableAllRules = function () {
		this._rules.forEach(function (oRule) { return oRule.enabled = false; });
	};

	/**
	 * Will add rule in checks chain again
	 * @param {string} sRuleName Rule name to enable
	 */
	RulesProcessor.prototype.enableRule = function (sRuleName) {
		var oRule = find(this._rules, function (oRule) { return oRule.name === sRuleName; });
		if(oRule) {
			oRule.enabled = true;
		}
	};

	/**
	 * Will not remove rule from checks, but will not execute it's action method
	 * @param {string} sRuleName Rule name to disable
	 */
	RulesProcessor.prototype.disableRule = function (sRuleName) {
		var oRule = find(this._rules, function (oRule) { return oRule.name === sRuleName; });
		if(oRule) {
			oRule.enabled = false;
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
		var aCalledRules = new Array(this._rules.length).map(function () { return false; });

		var that = this;

		aWords.forEach(function (sWord) {
			that._rules.forEach(function (oRule, iRuleIndex) {
				if(!aCalledRules[iRuleIndex] && oRule.enabled) {

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

							if(oRule.callOnce) {
								aCalledRules[iRuleIndex] = true;
							}
							break;
						}

					}

				}
			});
		});

		return oResult;
	};

	return RulesProcessor;
});
