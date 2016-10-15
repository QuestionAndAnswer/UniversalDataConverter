define([
	"UniversalDataConverter/CommonConversions",
	"UniversalDataConverter/utils",
	"test/ComplexConversionTestsData",
	"UniversalDataConverter/DataConverter"
], function(CommonConversions, utils, TestsData, DataConverter) {
	QUnit.module("Complex conversion module");

	QUnit.test("Real data complex conversion 1", function(assert) {
		var oData = TestsData[0];
		var oExpected = TestsData[1];

		var oReplacementTable = {
			"0001": "One",
			"0002": "Two",
			"0003": "Three",
			"0004": "Four"
		};

		var aModificationPass = [
			CommonConversions.MoveToParent("results"),
			CommonConversions.DeleteMatchedFields("__metadata$")
		];

		var aWriteSettingsPass = [{
			//write settings to all ClauseItem by getting this settings from clause
			inPath: "(/ClauseHeaders/[0-9]+)/UpperItems/[0-9]+$",
			outValue: function(oArgs) {
				var oClause = utils.getValByPath(oArgs.data, oArgs.matchedGroups[0]);
				var oClauseItem = oArgs.item;
				oClauseItem.Settings = oClause.Settings;
				return oClauseItem;
			}
		}];

		var aExtractionPass = [{
			//convert all properties in CustomFields that contains Over string
			inPath: "/CustomFields/[A-z]*Over",
			outValue: function(oArgs) {
				return oArgs.item.toString();
			}
		}, {
			//direct copy all other fields that don't have Over substring in name
			inPath: "/CustomFields/(?![A-z]*Over).*"
		}, {
			//general data collection to separate clause
			//using this syntax, all pathes will be matched through or operation
			//it means that outPath and outValue callbacks will be triggered
			//if at least on path has been matched
			inPath: ["(/Amount$)", "(/One$)", "(/Scope$)", "(/Title$)"],
			outPath: "/GeneralData$1"
		}, {
			//extract clauses and write them by they ids. Simillar to indexBy operation
			inPath: /\/ClauseHeaders\/[0-9]+$/g,
			outPath: function(oArgs) {
				return "/" + oReplacementTable[oArgs.item.ClauseId]; //write in destination root
			},
			outValue: function(oArgs) {
				switch (oArgs.item.ClauseId) {
					case "0001":
						return new DataConverter({
							extractions: CommonConversions.IndexBy("/UpperItems", "/", ["ClassType", "EntityType"])
								.extend({
									extendWith: {
										GUID: ""
									}
								}),
							default: {
								RIMAC: {
									CREDI: {},
									KREG: {},
									INGOO: {}
								},
								CP: {
									CREDI: {},
									KREG: {},
									INGOO: {}
								},
								RP: {
									CREDI: {},
									KREG: {},
									INGOO: {}
								}
							}
						}).convert(oArgs.item);
					case "0002":
						return new DataConverter({
							extractions: CommonConversions.IndexBy("/UpperItems", "/", "RiskType").extend({
								extendWith: {
									GUID: ""
								}
							}),
							default: {
								POLIT: {},
								POLILLICT: {},
								COMDOM: {},
								COMCROS: {}
							}
						}).convert(oArgs.item);
					default:
						return oArgs.item;
				}
			}
		}];

		var oResult = new DataConverter({
			modifications: [aModificationPass, aWriteSettingsPass],
			extractions: aExtractionPass
		}).convert(oData);

		assert.deepEqual(oResult, oExpected);
	});
});
