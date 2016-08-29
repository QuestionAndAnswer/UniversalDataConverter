# universal-data-converter.js
Library for convenience complex data manipulations and transformations.

Library allow you manipulate data, transform it, restructurize it, append additional parameters, remove redundant and so on. There are several options for transformating. You can transform object's node that accessed under one pass and place result to another, you can broadcast single node into several output object's nodes, you can merge multiple object's nodes into one. This all available under single simple interface.

## Usage example
```bash
var oConverter = new UDC({
  conversions: [
    {
      inPath: "/d",
      types: "MyType",
      direct: function (oItem) {
        return oItem.secondProp = 25;
      },
      reverse: function (oItem) {
        delete oItem.secondProp;
        return oItem;
      }
    }
  ],
  config: {
    customTypes: [
      {
        name: "MyType",
        check: function (oItem) {
          return oItem.hasOwnProperty("myProp") && oItem.myProp === "MyType1";
        }
      }
    ]
  }
});
var oInData = {
  //data structure here
};
var oOutData = oConverter.direct(oInData);
var oOriginalData = oConverter.reverse(oOutData);

deepEqual(oInData, oOriginalData); //true
```
