define([
	"UniversalDataConverter/RulesProcessor"
], function (RulesProcessor) {
	QUnit.module("RulesProcessor");

	QUnit.test("RulesProcessor calls tests", function (assert) {
		var iNumsCount = 0;
		var iStringsCount = 0;
		var iNumsStringsCount = 0;

		var oProcessor = new RulesProcessor([
			{
				pattern: /^[0-9]+$/g,
				action: function () {
					assert.ok(true, "Nums call");
					iNumsCount++;
				}
			},
			{
				pattern: "^[A-z]+$",
				action: function () {
					assert.ok(true, "Strings call");
					iStringsCount++;
				}
			},
			{
				pattern: "^[A-z0-9]+$",
				action: function () {
					assert.ok(true, "NumsStrings call");
					iNumsStringsCount++;
				}
			}
		]);

		oProcessor.callMatched(["123", "asdasd", "11asd"]);

		assert.equal(iNumsCount, 1, "Nums call times");
		assert.equal(iStringsCount, 1, "Strings call times");
		assert.equal(iNumsStringsCount, 3, "NumsStrings call times");
	});

	QUnit.test("params tests", function (assert) {
		var oProcessor = new RulesProcessor([
			{
				pattern: [/^([0-9]+)$/g],
				action: function (oArgs, iNum) {
					return parseInt(oArgs.matchedGroups[0]) + iNum;
				}
			},
			{
				pattern: "^[A-z]+$",
				action: function () {
					return "9";
				}
			},
			{
				pattern: "(^[A-z0-9]+$)",
				action: function (oArgs, iNum) {
					return oArgs.matchedGroups[0] + iNum.toString();
				}
			}
		]);

		var aResult = oProcessor.callMatched(["123", "asdasd", "11asd"], 1);
		assert.deepEqual(aResult, [124, "1231", "9", "asdasd1", "11asd1"], "Returned values");
	});

	QUnit.test("addRule, removeRule, removeByName", function (assert) {
		var oProcessor = new RulesProcessor();
		assert.ok(true, "Empty RulesProcessor createion not thrown exception");

		oProcessor.addRule();
		assert.ok(true, "Empty rule adding not thrown exception");

		oProcessor.addRule({
			name: "Rule1",
			pattern: "1",
			action: function (oArgs) {
				return oArgs.rule.name;
			}
		});

		var oRule2 = {
			name: "Rule2",
			pattern: "2",
			action: function (oArgs) {
				return oArgs.rule.name;
			}
		};
		oProcessor.addRule(oRule2);
		assert.deepEqual(oProcessor.callMatched(["1", "2"]), ["Rule1", "Rule2"], "Added rules has been called");

		oProcessor.removeRule(oRule2);
		assert.deepEqual(oProcessor.callMatched(["1", "2"]), ["Rule1"], "After Rule2 remove only Rule1 called");

		oProcessor.removeRule("Rule1");
		assert.deepEqual(oProcessor.callMatched(["1", "2"]), [], "After Rule1 remove by name nothing were called");

		oProcessor.removeRule();
		assert.ok(true, "Empty removeRule call not thrown exception");
	});

	QUnit.test("call once", function (assert) {
		var oProcessor = new RulesProcessor([
			{
				"pattern": "once",
				"callOnce": true,
				"action": function () {
					return 1;
				},
			},
			{
				"pattern": "multi",
				"action": function () {
					return -1;
				}
			}
		]);

		var aResult = oProcessor.callMatched(["once", "multi", "multionce"]);
		assert.deepEqual(aResult, [1, -1, -1], "called once");
	});
});
